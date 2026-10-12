import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '../../../../lib/db';
import { sendReminderEmail } from '../../../../services/email';
import { logger } from '../../../../lib/logger';
import { withErrorHandler } from '../../../../lib/api-handler';

async function cronHandler(request: Request) {
  // 1. Validación estrictamente obligatoria del secreto de Cron
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!cronSecret || !authHeader) {
    logger.warn('Intento no autorizado o CRON_SECRET no configurado al acceder a /api/cron/reminders');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expectedAuth = `Bearer ${cronSecret}`;
  const hashExpected = crypto.createHash('sha256').update(expectedAuth).digest();
  const hashReceived = crypto.createHash('sha256').update(authHeader).digest();

  if (!crypto.timingSafeEqual(hashExpected, hashReceived)) {
    logger.warn('Token de autorización inválido en /api/cron/reminders');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  
  // Rango para 48 horas (entre 47 y 48 horas desde ahora)
  const start48 = new Date(now.getTime() + 47 * 60 * 60 * 1000);
  const end48 = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Rango para 2 horas (entre 1 y 2 horas desde ahora)
  const start2 = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const end2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Consultamos las citas programadas en esos rangos
  const q = `
    SELECT a.id, a.appointment_date, u.full_name, u.email
    FROM appointments a
    JOIN users u ON a.client_id = u.id
    WHERE a.status = 'scheduled' 
    AND (
      (a.appointment_date >= $1 AND a.appointment_date <= $2) OR
      (a.appointment_date >= $3 AND a.appointment_date <= $4)
    )
  `;

  const result = await query(q, [
    start48.toISOString(), end48.toISOString(),
    start2.toISOString(), end2.toISOString()
  ]);

  let sentCount = 0;

  for (const appt of result.rows) {
    const apptDate = new Date(appt.appointment_date);
    const diffHours = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const is2Hours = diffHours <= 2.5;

    try {
      await sendReminderEmail(
        appt.email,
        appt.full_name,
        apptDate,
        'Agendada',
        is2Hours
      );
      sentCount++;
    } catch (err) {
      logger.error(`Error enviando recordatorio a ${appt.email}:`, err);
    }
  }

  return NextResponse.json({ success: true, processed: result.rows.length, sent: sentCount });
}

export const GET = withErrorHandler(cronHandler);
