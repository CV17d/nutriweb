import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { withErrorHandler } from '../../../../lib/api-handler';
import { createAppointment } from '../../../../services/appointments';
import { sendVerificationEmail } from '../../../../services/email';
import { formatBogotaDateStr, getBusySlots } from '../../../../services/googleCalendar';
import { query } from '../../../../lib/db';
import { logger } from '../../../../lib/logger';

// Esquema de validación usando Zod
const appointmentSchema = z.object({
  date: z.string().datetime({ offset: true }).or(z.string()), // Acepta ISO con offset o UTC
  clientEmail: z.string().email(),
  clientName: z.string().min(2).max(100),
  phone: z.string().optional(),
  time: z.string().optional(),
  clientId: z.string().uuid().optional(),
  appointmentType: z.enum(['Presencial', 'Virtual']).default('Virtual'),
  captchaToken: z.string().min(1, "CAPTCHA es requerido"),
});

async function postHandler(request: Request) {
  try {
    const body = await request.json();
    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn({ message: 'Validación de entrada fallida en agendamiento', errors: parsed.error.format() });
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const { date, clientEmail, clientName, phone, clientId, appointmentType, captchaToken } = parsed.data;

    // 1. Verificar el CAPTCHA con Google
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.error('Error detallado al agendar: RECAPTCHA_SECRET_KEY no está configurado en las variables de entorno.');
      logger.error('RECAPTCHA_SECRET_KEY no está configurado en las variables de entorno.');
      return NextResponse.json({ success: false, message: 'Error interno del servidor (configuración de seguridad).' }, { status: 500 });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`;
    const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();

    if (!recaptchaData.success) {
      console.error('Error detallado al agendar (CAPTCHA fallido):', recaptchaData);
      logger.warn({ message: 'CAPTCHA fallido', recaptchaData });
      return NextResponse.json({ success: false, message: 'Fallo al verificar el CAPTCHA. Por favor intenta de nuevo.' }, { status: 400 });
    }

    // 2. Normalizar y validar la fecha seleccionada
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Fecha u hora inválida seleccionada.' }, { status: 400 });
    }

    if (parsedDate.getTime() <= Date.now()) {
      return NextResponse.json({ success: false, message: 'La fecha y hora seleccionada ya ha transcurrido. Por favor selecciona un horario futuro.' }, { status: 400 });
    }

    // 3. Validación de solapamiento en Supabase / Postgres (duración de cita = 120 min)
    // Las citas 'unverified' solo bloquean si se crearon hace menos de 30 minutos
    const slotStart = parsedDate;
    const slotEnd = new Date(slotStart.getTime() + 120 * 60000);

    const dbOverlap = await query(
      `SELECT id FROM appointments 
       WHERE appointment_date < $1 
       AND (appointment_date + INTERVAL '120 minutes') > $2
       AND (
         status = 'scheduled'
         OR (status = 'unverified' AND created_at >= NOW() - INTERVAL '30 minutes')
       )`,
      [slotEnd.toISOString(), slotStart.toISOString()]
    );

    if (dbOverlap.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'El horario seleccionado ya no se encuentra disponible. Por favor elige otro horario.',
      }, { status: 409 });
    }

    // 4. Validación de solapamiento en Google Calendar
    try {
      const dateStr = formatBogotaDateStr(parsedDate);
      const gcalBusy = await getBusySlots(dateStr);
      const hasGCalOverlap = gcalBusy.some(busy => {
        return slotStart.getTime() < busy.end.getTime() && slotEnd.getTime() > busy.start.getTime();
      });
      if (hasGCalOverlap) {
        return NextResponse.json({
          success: false,
          message: 'El horario seleccionado ya está reservado en la agenda. Por favor elige otro horario.',
        }, { status: 409 });
      }
    } catch (gcalErr) {
      console.error('Error detallado al agendar (verificando GCal overlap):', gcalErr);
    }

    // 5. Asegurar existencia de usuario en tabla 'users' para cumplir Foreign Key
    let actualClientId: string = clientId || '';
    if (!actualClientId || actualClientId === "00000000-0000-0000-0000-000000000000") {
      const userQuery = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [clientEmail.trim()]);
      if (userQuery.rows.length > 0) {
        actualClientId = userQuery.rows[0].id;
      } else {
        actualClientId = crypto.randomUUID();
        await query(
          'INSERT INTO users (id, email, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
          [actualClientId, clientEmail.toLowerCase().trim(), clientName.trim(), 'no_password', 'client']
        );
      }
    }

    // 6. Crear la cita en estado 'unverified'
    const result = await createAppointment({
      clientId: actualClientId,
      clientEmail,
      clientName,
      clientPhone: phone,
      date: parsedDate,
      isFreeConsultation: true,
      appointmentType,
    });

    // 7. Enviar correo de verificación con URL base de producción
    const originHeader = request.headers.get('origin');
    const hostHeader = request.headers.get('host');
    const protoHeader = request.headers.get('x-forwarded-proto') || 'https';
    let requestBaseUrl: string | undefined = undefined;
    if (originHeader && !originHeader.includes('localhost')) {
      requestBaseUrl = originHeader;
    } else if (hostHeader && !hostHeader.includes('localhost')) {
      requestBaseUrl = `${protoHeader}://${hostHeader}`;
    }

    if (result.verificationToken) {
      try {
        await sendVerificationEmail(
          clientEmail,
          clientName,
          result.verificationToken,
          parsedDate,
          appointmentType,
          requestBaseUrl
        );
      } catch (emailError: any) {
        console.error('Error detallado al agendar (envío de email):', emailError);
        logger.error('[Email Error]: Error enviando correo de verificación:', emailError);
        // Si falla el envío de email, revertir la cita para evitar slots bloqueados
        await query('DELETE FROM appointments WHERE id = $1', [result.appointmentId]);
        return NextResponse.json({
          success: false,
          message: 'No pudimos enviar el correo de verificación. Por favor revisa que tu email esté escrito correctamente e intenta de nuevo.',
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Se ha enviado un correo para verificar tu cita. Por favor revisa tu bandeja de entrada o spam.',
      appointmentId: result.appointmentId,
    });
  } catch (error: any) {
    console.error('Error detallado al agendar:', error);
    logger.error('[Appointments Free Error]: Error detallado al agendar:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Error al agendar la cita',
        error: error?.message || 'Error al agendar la cita',
      },
      { status: 500 }
    );
  }
}

// Aplicar nuestro interceptor seguro global
export const POST = withErrorHandler(postHandler);
