import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '../../../../lib/api-handler';
import { createAppointment } from '../../../../services/appointments';
import { logger } from '../../../../lib/logger';

// Esquema estricto de validación usando Zod
const appointmentSchema = z.object({
  date: z.string().datetime(), // Formato ISO 8601 válido requerido
  clientEmail: z.string().email(),
  clientName: z.string().min(2).max(100),
  // En un entorno de producción, esto vendría del token de sesión (NextAuth / JWT).
  // Se deja opcional aquí para permitir pruebas sin autenticación activa.
  clientId: z.string().uuid().optional(),
  appointmentType: z.enum(['Presencial', 'Virtual']).default('Virtual'),
  captchaToken: z.string().min(1, "CAPTCHA es requerido"),
});

import { sendVerificationEmail } from '../../../../services/email';

async function postHandler(request: Request) {
  const body = await request.json();
  const parsed = appointmentSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn({ message: 'Validación de entrada fallida en agendamiento', errors: parsed.error.format() });
    return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
  }

  const { date, clientEmail, clientName, clientId, appointmentType, captchaToken } = parsed.data;

  // Verificar el CAPTCHA con Google
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (!recaptchaSecret) {
    logger.error('RECAPTCHA_SECRET_KEY no está configurado en las variables de entorno.');
    return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`;
  const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
  const recaptchaData = await recaptchaRes.json();

  if (!recaptchaData.success) {
    logger.warn({ message: 'CAPTCHA fallido', recaptchaData });
    return NextResponse.json({ success: false, message: 'Fallo al verificar el CAPTCHA. Eres un robot?' }, { status: 400 });
  }

  // Placeholder para la sesión del usuario si no se proporciona.
  // IMPORTANTE: Para que RLS funcione en PostgreSQL, este UUID debe coincidir con un registro válido en 'users'
  const actualClientId = clientId || "00000000-0000-0000-0000-000000000000";

  const result = await createAppointment({
    clientId: actualClientId,
    clientEmail,
    clientName,
    date: new Date(date),
    isFreeConsultation: true, // Se fuerza porque el endpoint es exclusivo para gratuitas
    appointmentType,
  });

  if (result.verificationToken) {
    await sendVerificationEmail(
      clientEmail,
      clientName,
      result.verificationToken,
      new Date(date),
      appointmentType
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Se ha enviado un correo para verificar la cita',
    appointmentId: result.appointmentId,
  });
}

// Aplicar nuestro interceptor seguro global
export const POST = withErrorHandler(postHandler);
