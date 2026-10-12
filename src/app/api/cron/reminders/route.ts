import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { sendReminderEmail } from '../../../../services/email';
import { logger } from '../../../../lib/logger';

// Este endpoint debería ser llamado cada hora por un CronJob (ej. Vercel Cron)
export async function GET(request: Request) {
  try {
    // Validar token de seguridad (opcional pero recomendado para crons)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
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
      // Diferencia en horas
      const diffHours = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      const is2Hours = diffHours <= 2.5;

      try {
        await sendReminderEmail(
          appt.email,
          appt.full_name,
          apptDate,
          'Agendada', // Fallback genérico ya que no guardamos el tipo en la BD
          is2Hours
        );
        sentCount++;
      } catch (err) {
        logger.error(`Error enviando recordatorio a ${appt.email}:`, err);
      }
    }

    return NextResponse.json({ success: true, processed: result.rows.length, sent: sentCount });
  } catch (error: any) {
    logger.error('Error procesando cron de recordatorios:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
