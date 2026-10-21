import { Resend } from 'resend';
import { logger } from '../lib/logger';

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY no está configurado en las variables de entorno');
  }
  return new Resend(apiKey);
}

/**
 * Envía un correo de verificación para confirmar la cita gratuita.
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
  appointmentDate: Date,
  appointmentType: string
) {
  try {
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/api/appointments/verify?token=${token}`;

    // Formatear fecha para el correo
    const dateStr = appointmentDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Andrés Burbano Nutrición <citas@andresburbanonutricionista.com>',
      to: [email],
      subject: 'Verifica tu Cita Gratuita - Andrés Burbano',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #0052FF;">¡Hola ${name}!</h2>
          <p>Has solicitado una <strong>cita gratuita (${appointmentType})</strong> para el <strong>${dateStr}</strong>.</p>
          <p>Para confirmar tu asistencia y añadir la cita a nuestro calendario, por favor haz clic en el siguiente botón:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #0052FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Sí, soy yo / Confirmar Cita
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;"><a href="${verifyUrl}">${verifyUrl}</a></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Si no solicitaste esta cita, puedes ignorar este correo de forma segura.
          </p>
        </div>
      `,
    });

    if (error) {
      logger.error('[Email Error]: Error enviando correo de verificación con Resend', error);
      throw new Error('No se pudo enviar el correo de verificación');
    }

    logger.info({ message: 'Correo de verificación enviado exitosamente', id: data?.id });
    return data;
  } catch (error) {
    logger.error('[Email Error]: Excepción enviando correo de verificación', error);
    throw error;
  }
}

/**
 * Envía el correo final de confirmación con los detalles y el enlace de Meet
 */
export async function sendFinalConfirmationEmail(
  email: string,
  name: string,
  appointmentDate: Date,
  appointmentType: string,
  meetLink: string
) {
  try {
    const dateStr = appointmentDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const endTime = new Date(appointmentDate.getTime() + 120 * 60000); // 2 horas
    const formatGCalDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const startStr = formatGCalDate(appointmentDate);
    const endStr = formatGCalDate(endTime);

    const clinicLink = process.env.CLINIC_LOCATION_LINK || 'https://maps.app.goo.gl/1r8denLgxkjWyQiC8';
    const isPresencial = appointmentType === 'Presencial';

    const title = encodeURIComponent("Cita Nutricional - Andrés Burbano");
    const detailsText = isPresencial
      ? `Cita nutricional (Presencial).\nUbicación: ${clinicLink}`
      : `Cita nutricional (Virtual).${meetLink ? `\nEnlace de reunión: ${meetLink}` : ''}`;
    const details = encodeURIComponent(detailsText);
    const location = encodeURIComponent(isPresencial ? clinicLink : meetLink);

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Andrés Burbano Nutrición <citas@andresburbanonutricionista.com>',
      to: [email],
      subject: '✅ Cita Confirmada - Andrés Burbano',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #ecfdf5; color: #10b981; border-radius: 50%; padding: 15px; margin-bottom: 10px;">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 style="color: #111827; margin: 0;">¡Tu cita está confirmada!</h2>
          </div>
          
          <p>Hola <strong>${name}</strong>,</p>
          <p>Tu cita nutricional ha sido agendada exitosamente en nuestro calendario.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0052FF;">
            <p style="margin: 5px 0;"><strong>📅 Fecha y Hora:</strong> ${dateStr}</p>
            <p style="margin: 5px 0;"><strong>📍 Modalidad:</strong> ${appointmentType}</p>
            ${appointmentType === 'Virtual' && meetLink ? `<p style="margin: 5px 0;"><strong>💻 Enlace a la reunión:</strong> <a href="${meetLink}" style="color: #0052FF;">Unirse con Google Meet</a></p>` : ''}
            ${appointmentType === 'Presencial' ? `<p style="margin: 5px 0;"><strong>🏢 Ubicación del consultorio:</strong> <a href="${clinicLink}" style="color: #0052FF;">Ver en Google Maps</a></p>` : ''}
          </div>

          <p>Te recomendamos agregar este evento a tu calendario personal para que recibas un recordatorio antes de la reunión.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${gcalUrl}" style="background-color: #0052FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🗓️ Agregar a Google Calendar
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">¡Nos vemos pronto!</p>
        </div>
      `,
    });

    if (error) {
      logger.error('[Email Error]: Error enviando correo de confirmación final con Resend', error);
      throw new Error('No se pudo enviar el correo de confirmación');
    }

    logger.info({ message: 'Correo final de confirmación enviado exitosamente', id: data?.id });
    return data;
  } catch (error) {
    logger.error('[Email Error]: Excepción enviando correo de confirmación final', error);
    throw error;
  }
}

/**
 * Envía el enlace de agenda exclusiva tras comprar un plan
 */
export async function sendSubscriptionLinkEmail(
  email: string,
  name: string,
  subscriptionId: string,
  planName: string,
  sessionsUsed: number = 1,
  totalSessions: number = 1,
  customBaseUrl?: string
) {
  try {
    const appUrl = customBaseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const agendaUrl = `${appUrl}/agenda/${subscriptionId}`;

    const message = sessionsUsed <= 1
      ? `Tu primera cita ya está en proceso. Para tus <strong>próximas consultas</strong>, hemos creado una agenda exclusiva para ti. Desde allí podrás reservar la fecha y hora de tus siguientes sesiones a medida que avances en el plan.`
      : `Es momento de agendar tu <strong>siguiente cita de seguimiento</strong> (Sesión ${sessionsUsed + 1} de ${totalSessions}). Desde tu agenda exclusiva podrás reservar la fecha y hora de tu próxima sesión.`;

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Andrés Burbano Nutrición <citas@andresburbanonutricionista.com>',
      to: [email],
      subject: '🌟 Tu Agenda Privada - Andrés Burbano',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #0052FF; text-align: center;">¡Gracias por adquirir el Plan ${planName}!</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>${message}</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <a href="${agendaUrl}" style="background-color: #0052FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🗓️ Entrar a mi Agenda Privada
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">El sistema te mostrará automáticamente las fechas disponibles según el progreso de tu plan.</p>
        </div>
      `,
    });

    if (error) {
      logger.error('[Email Error]: Error enviando correo de agenda exclusiva', error);
      throw new Error('No se pudo enviar el correo de agenda');
    }
    return data;
  } catch (error) {
    logger.error('[Email Error]: Excepción enviando correo de agenda exclusiva', error);
    throw error;
  }
}

/**
 * Envía el recordatorio de cita (48h o 2h antes)
 */
export async function sendReminderEmail(
  email: string,
  name: string,
  appointmentDate: Date,
  appointmentType: string,
  is2Hours: boolean
) {
  try {
    const timeText = is2Hours ? "2 HORAS" : "48 HORAS";
    const clinicLink = process.env.CLINIC_LOCATION_LINK || 'https://maps.app.goo.gl/1r8denLgxkjWyQiC8';
    const meetLink = process.env.MEET_LINK || '';

    const dateStr = appointmentDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Andrés Burbano Nutrición <citas@andresburbanonutricionista.com>',
      to: [email],
      subject: `⏳ Recordatorio: Tu cita es en ${timeText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #F59E0B; text-align: center;">¡Faltan ${timeText} para tu cita!</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>Te recordamos que tienes una cita nutricional programada muy pronto.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="margin: 5px 0;"><strong>📅 Fecha y Hora:</strong> ${dateStr}</p>
            <p style="margin: 5px 0;"><strong>📍 Modalidad:</strong> ${appointmentType}</p>
            ${appointmentType === 'Virtual' && meetLink ? `<p style="margin: 5px 0;"><strong>💻 Enlace a la reunión:</strong> <a href="${meetLink}" style="color: #0052FF;">Unirse con Google Meet</a></p>` : ''}
            ${appointmentType === 'Presencial' ? `<p style="margin: 5px 0;"><strong>🏢 Ubicación del consultorio:</strong> <a href="${clinicLink}" style="color: #0052FF;">Ver en Google Maps</a></p>` : ''}
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">¡Por favor, sé puntual! Nos vemos pronto.</p>
        </div>
      `,
    });

    if (error) throw new Error('No se pudo enviar el correo de recordatorio');
    return data;
  } catch (error) {
    logger.error('[Email Error]: Excepción enviando recordatorio', error);
    throw error;
  }
}

/**
 * Envía una alerta de seguridad al administrador tras detectarse ataques o bloqueos por fuerza bruta
 */
export async function sendSecurityAlertEmail(
  toEmail: string,
  event: {
    ip: string;
    path: string;
    attempts: number;
    timestamp: Date;
    userAgent?: string;
  }
) {
  try {
    const resend = getResendClient();
    const dateStr = event.timestamp.toLocaleString('es-ES', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const { data, error } = await resend.emails.send({
      from: 'Alerta de Seguridad <seguridad@andresburbanonutricionista.com>',
      to: [toEmail],
      subject: `🚨 ALERTA: Bloqueo de Fuerza Bruta Detectado (IP: ${event.ip})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937; border: 2px solid #ef4444; border-radius: 8px;">
          <h2 style="color: #b91c1c; margin-top: 0;">⚠️ Alerta de Seguridad del Sistema</h2>
          <p>Se ha activado una medida defensiva de <strong>Rate Limiting y Bloqueo</strong> debido a múltiples intentos fallidos de autenticación en el panel administrativo.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Dirección IP Bloqueada:</strong> <code>${event.ip}</code></p>
            <p style="margin: 4px 0;"><strong>Ruta Objetivo:</strong> <code>${event.path}</code></p>
            <p style="margin: 4px 0;"><strong>Intentos Realizados:</strong> ${event.attempts}</p>
            <p style="margin: 4px 0;"><strong>Fecha y Hora:</strong> ${dateStr} (GMT-5)</p>
            ${event.userAgent ? `<p style="margin: 4px 0;"><strong>User Agent:</strong> <small>${event.userAgent}</small></p>` : ''}
          </div>

          <p style="font-size: 14px; color: #4b5563;">La dirección IP sospechosa ha sido bloqueada temporalmente por la base de datos de Rate Limiting. No se requiere ninguna acción si tu contraseña administrativa es segura.</p>
        </div>
      `,
    });

    if (error) {
      logger.error('[Email Error]: Error enviando alerta de seguridad por correo', error);
      return null;
    }
    return data;
  } catch (error) {
    logger.error('[Email Error]: Excepción al intentar enviar correo de alerta de seguridad', error);
    return null;
  }
}

