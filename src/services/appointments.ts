import { query } from '../lib/db';
import { createAppointmentEvent } from './googleCalendar';
import { consumeSession } from './subscriptions';
import { logger } from '../lib/logger';
import { sendFinalConfirmationEmail } from './email';

import crypto from 'crypto';

interface CreateAppointmentParams {
  clientId: string;
  clientEmail: string;
  clientName: string;
  clientPhone?: string;
  date: Date;
  isFreeConsultation: boolean;
  subscriptionId?: string;
  planName?: string;
  appointmentType?: string;
}

export async function createAppointment(params: CreateAppointmentParams) {
  const { clientId, clientEmail, clientName, clientPhone, date, isFreeConsultation, subscriptionId, appointmentType = 'Virtual' } = params;

  let status = 'scheduled';
  let verificationToken = null;

  if (isFreeConsultation) {
    status = 'unverified';
    verificationToken = crypto.randomBytes(32).toString('hex');
  }

  // 1. Insertar el registro en la base de datos de manera segura
  const insertQuery = `
    INSERT INTO appointments (client_id, appointment_date, is_free_consultation, status, subscription_id, verification_token)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
  `;
  
  const result = await query(insertQuery, [clientId, date, isFreeConsultation, status, subscriptionId || null, verificationToken]);
  const appointmentId = result.rows[0].id;

  logger.info({ message: 'Cita guardada en la base de datos', appointmentId, status });

  // 1.5. Si no es gratuita y tiene suscripción, consumir una sesión
  if (!isFreeConsultation && subscriptionId) {
    try {
      await consumeSession(subscriptionId);
    } catch (error: any) {
      logger.error('[Appointments Error]: Error al consumir sesión de suscripción. Revirtiendo cita...', error);
      // En un entorno de prod robusto, usaríamos BEGIN y COMMIT para transacción real
      await query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
      throw error;
    }
  }

  // 2. Crear evento automáticamente en Google Calendar (solo si NO es gratuita, ya que las gratuitas requieren verificación primero)
  if (!isFreeConsultation) {
    try {
      let finalPlanName = params.planName;
      if (subscriptionId && !finalPlanName) {
        const planRes = await query(
          'SELECT p.name FROM plans p JOIN client_subscriptions cs ON cs.plan_id = p.id WHERE cs.id = $1', 
          [subscriptionId]
        );
        if (planRes.rows.length > 0) {
          finalPlanName = planRes.rows[0].name;
        }
      }

      const eventResult = await createAppointmentEvent(clientEmail, clientName, date, false, finalPlanName, appointmentType, clientPhone);

      // Enviar correo de confirmación final
      const meetLink = process.env.MEET_LINK || '';
      await sendFinalConfirmationEmail(
        clientEmail,
        clientName,
        date,
        appointmentType,
        meetLink
      );
    } catch (error: any) {
      // Si Google Calendar falla, no eliminamos la cita de la BD (Eventual consistency / Dead letter)
      logger.error({ message: '[Appointments Error]: Fallo al crear evento en GCal o enviar correo de confirmación', appointmentId }, error);
    }
  }

  return { appointmentId, verificationToken };
}

export async function confirmFreeAppointment(token: string) {
  // 1. Buscar la cita por token
  const findQuery = `
    SELECT a.id, a.appointment_date, a.status, u.full_name, u.email
    FROM appointments a
    JOIN users u ON a.client_id = u.id
    WHERE a.verification_token = $1
  `;
  
  const res = await query(findQuery, [token]);
  
  if (res.rows.length === 0) {
    throw new Error('Token inválido o expirado.');
  }

  const appointment = res.rows[0];

  // Si ya fue verificada (status = 'scheduled'), simplemente retornamos los datos sin volver a crear el evento.
  // Esto previene errores si el cliente de correo pre-carga el enlace antes de que el usuario haga clic.
  if (appointment.status === 'scheduled') {
    return {
      id: appointment.id,
      date: new Date(appointment.appointment_date),
      type: 'Virtual'
    };
  }

  if (appointment.status !== 'unverified') {
    throw new Error('La cita no está en un estado válido para ser verificada.');
  }

  // 2. Actualizar el estado (dejamos el token para futuras visitas al enlace)
  await query(
    `UPDATE appointments SET status = 'scheduled' WHERE id = $1`,
    [appointment.id]
  );

  // 3. Crear el evento en Google Calendar y enviar correo final
  try {
    const eventResult = await createAppointmentEvent(
      appointment.email, 
      appointment.full_name, 
      new Date(appointment.appointment_date), 
      true, 
      undefined, 
      'Virtual' // Asumimos virtual por defecto para gratuitas
    );

    // En lugar de enviar un segundo correo, retornamos los datos para que 
    // la página web muestre el botón de agregar a Google Calendar.
  } catch (error: any) {
    logger.error({ message: '[Appointments Error]: Fallo al crear evento en GCal durante la confirmación', appointmentId: appointment.id }, error);
  }

  return {
    id: appointment.id,
    date: new Date(appointment.appointment_date),
    type: 'Virtual'
  };
}
