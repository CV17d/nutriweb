import { query } from '../lib/db';
import { createAppointmentEvent, deleteAppointmentEvent, findAndDeleteEventByDate } from './googleCalendar';
import { consumeSession } from './subscriptions';
import { logger } from '../lib/logger';
import { sendFinalConfirmationEmail, sendCancellationEmail } from './email';
import crypto from 'crypto';

interface CreateAppointmentParams {
  clientId?: string;
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
  try {
    const { clientId, clientEmail, clientName, clientPhone, date, isFreeConsultation, subscriptionId, appointmentType = 'Virtual' } = params;

    // 1. Asegurar que exista un usuario válido en la tabla 'users' para satisfacer la clave foránea
    let validClientId = clientId;
    if (!validClientId || validClientId === '00000000-0000-0000-0000-000000000000') {
      const userCheck = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [clientEmail.trim()]);
      if (userCheck.rows.length > 0) {
        validClientId = userCheck.rows[0].id;
      } else {
        validClientId = crypto.randomUUID();
        await query(
          'INSERT INTO users (id, email, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
          [validClientId, clientEmail.toLowerCase().trim(), clientName.trim(), 'no_password', 'client']
        );
      }
    }

    let status = 'scheduled';
    let verificationToken = null;

    if (isFreeConsultation) {
      status = 'unverified';
      verificationToken = crypto.randomBytes(32).toString('hex');
    }

    // 2. Insertar el registro en la base de datos de manera segura
    const insertQuery = `
      INSERT INTO appointments (client_id, appointment_date, is_free_consultation, status, subscription_id, verification_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    
    const result = await query(insertQuery, [validClientId, date, isFreeConsultation, status, subscriptionId || null, verificationToken]);
    const appointmentId = result.rows[0].id;

    logger.info({ message: 'Cita guardada en la base de datos', appointmentId, status });

    // 2.5. Si no es gratuita y tiene suscripción, consumir una sesión
    if (!isFreeConsultation && subscriptionId) {
      try {
        await consumeSession(subscriptionId);
      } catch (error: any) {
        console.error('Error detallado al agendar (consumeSession):', error);
        logger.error('[Appointments Error]: Error al consumir sesión de suscripción. Revirtiendo cita...', error);
        // En un entorno de prod robusto, usaríamos BEGIN y COMMIT para transacción real
        await query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
        throw error;
      }
    }

    // 3. Crear evento automáticamente en Google Calendar (solo si NO es gratuita, ya que las gratuitas requieren verificación primero)
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

        if (eventResult?.id) {
          try {
            await query('UPDATE appointments SET google_event_id = $1 WHERE id = $2', [eventResult.id, appointmentId]);
          } catch (colErr: any) {
            logger.warn({ message: 'No se pudo actualizar google_event_id en appointments', error: colErr?.message });
          }
        }

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
        console.error('Error detallado al agendar (Google Calendar/Email):', error);
        // Si Google Calendar falla, no eliminamos la cita de la BD (Eventual consistency / Dead letter)
        logger.error({ message: '[Appointments Error]: Fallo al crear evento en GCal o enviar correo de confirmación', appointmentId }, error);
      }
    }

    return { appointmentId, verificationToken };
  } catch (error: any) {
    console.error('Error detallado al agendar:', error);
    logger.error('[Appointments Error]: Error detallado al agendar:', error);
    throw error;
  }
}

export async function confirmFreeAppointment(token: string) {
  try {
    const cleanToken = token.trim();

    // 1. Buscar la cita por verification_token o por id
    const findQuery = `
      SELECT a.id, a.appointment_date, a.status, a.created_at,
             COALESCE(u.full_name, 'Paciente') as full_name, 
             COALESCE(u.email, '') as email
      FROM appointments a
      LEFT JOIN users u ON a.client_id = u.id
      WHERE TRIM(a.verification_token) = $1
         OR a.id::text = $1
    `;
    
    const res = await query(findQuery, [cleanToken]);
    
    if (res.rows.length === 0) {
      console.error(`Error detallado en verificación de cita: No se encontró cita para el token/id: "${cleanToken}"`);
      throw new Error('Token inválido o cita no encontrada.');
    }

    const appointment = res.rows[0];

    // Si ya fue verificada (status = 'scheduled'), retornamos los datos sin duplicar el evento.
    // Esto previene errores si clientes de correo pre-cargan el enlace antes del clic del usuario.
    if (appointment.status === 'scheduled') {
      logger.info({ message: 'Cita ya se encontraba verificada', appointmentId: appointment.id });
      return {
        id: appointment.id,
        date: new Date(appointment.appointment_date),
        type: 'Virtual'
      };
    }

    if (appointment.status !== 'unverified') {
      console.error(`Error detallado en verificación de cita: Estado inválido "${appointment.status}" en cita ${appointment.id}`);
      throw new Error('La cita no está en un estado válido para ser verificada.');
    }

    // 2. Verificar si el horario fue tomado por otra cita confirmada (en caso de que hayan pasado > 30 min)
    const slotStart = new Date(appointment.appointment_date);
    const slotEnd = new Date(slotStart.getTime() + 120 * 60000);

    const conflictCheck = await query(
      `SELECT id FROM appointments 
       WHERE id != $1 
       AND status = 'scheduled'
       AND appointment_date < $2 
       AND (appointment_date + INTERVAL '120 minutes') > $3`,
      [appointment.id, slotEnd.toISOString(), slotStart.toISOString()]
    );

    if (conflictCheck.rows.length > 0) {
      console.error(`Error detallado en verificación de cita: Horario en conflicto para cita ${appointment.id}`);
      throw new Error('El tiempo para confirmar la cita expiró y el horario ya fue reservado por otro paciente. Por favor agenda una nueva cita.');
    }

    // 3. Actualizar el estado a 'scheduled'
    await query(
      `UPDATE appointments SET status = 'scheduled' WHERE id = $1`,
      [appointment.id]
    );

    // 4. Crear el evento en Google Calendar usando la hora local de Bogotá
    try {
      const eventResult = await createAppointmentEvent(
        appointment.email, 
        appointment.full_name, 
        new Date(appointment.appointment_date), 
        true, 
        undefined, 
        'Virtual' // Asumimos virtual por defecto para gratuitas
      );
      if (eventResult?.id) {
        try {
          await query('UPDATE appointments SET google_event_id = $1 WHERE id = $2', [eventResult.id, appointment.id]);
        } catch (colErr: any) {
          logger.warn({ message: 'No se pudo actualizar google_event_id en appointments tras verificación', error: colErr?.message });
        }
      }
      logger.info({ message: 'Evento de Google Calendar creado tras verificación exitosa', appointmentId: appointment.id, eventId: eventResult?.id });
    } catch (error: any) {
      console.error('Error detallado en verificación de cita (Google Calendar):', error);
      logger.error({ message: '[Appointments Error]: Fallo al crear evento en GCal durante la confirmación', appointmentId: appointment.id }, error);
    }

    return {
      id: appointment.id,
      date: new Date(appointment.appointment_date),
      type: 'Virtual'
    };
  } catch (error: any) {
    console.error('Error detallado en verificación de cita:', error);
    logger.error('[Appointments Error]: Error al confirmar cita gratuita:', error);
    throw error;
  }
}

/**
 * Cancela una cita confirmada o pendiente.
 * - Elimina el evento en Google Calendar si existe
 * - Restaura la sesión en la suscripción si era de plan
 * - Actualiza el estado a 'cancelled' y registra cancelled_at
 * - Notifica al paciente por correo vía Resend
 */
export async function cancelAppointment(appointmentId: string, reason?: string) {
  try {
    // 1. Obtener la información de la cita y paciente
    const appointmentRes = await query(`
      SELECT 
        a.id, 
        a.appointment_date, 
        a.status, 
        a.is_free_consultation, 
        a.google_event_id, 
        a.subscription_id,
        COALESCE(u.full_name, 'Paciente') as client_name,
        COALESCE(u.email, '') as client_email
      FROM appointments a
      LEFT JOIN users u ON a.client_id = u.id AND a.client_id != '00000000-0000-0000-0000-000000000000'
      WHERE a.id = $1
    `, [appointmentId]);

    if (appointmentRes.rows.length === 0) {
      throw new Error('Cita no encontrada en el sistema');
    }

    const appointment = appointmentRes.rows[0];

    // 2. Eliminar evento en Google Calendar si existe
    let calendarDeleted = false;
    if (appointment.google_event_id) {
      calendarDeleted = await deleteAppointmentEvent(appointment.google_event_id);
    } else if (appointment.appointment_date) {
      // Fallback para citas creadas previamente sin google_event_id
      calendarDeleted = await findAndDeleteEventByDate(
        new Date(appointment.appointment_date),
        appointment.client_email || appointment.client_name
      );
    }

    // 3. Restaurar sesión de suscripción si aplica
    if (!appointment.is_free_consultation && appointment.subscription_id && appointment.status === 'scheduled') {
      try {
        await query(`
          UPDATE client_subscriptions
          SET 
            sessions_remaining = sessions_remaining + 1,
            sessions_used = GREATEST(0, sessions_used - 1),
            status = 'active',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [appointment.subscription_id]);
        logger.info({ message: 'Sesión devuelta a la suscripción tras cancelación', subscriptionId: appointment.subscription_id });
      } catch (subErr: any) {
        logger.error('[Cancel Appointment]: Error restaurando sesión en suscripción', subErr?.message || subErr);
      }
    }

    // 4. Actualizar estado a 'cancelled' y registrar timestamp
    try {
      await query(`
        UPDATE appointments 
        SET status = 'cancelled', cancelled_at = NOW()
        WHERE id = $1
      `, [appointmentId]);
    } catch (dbErr: any) {
      // Fallback por si la columna cancelled_at tuviera algún conflicto
      await query(`
        UPDATE appointments 
        SET status = 'cancelled'
        WHERE id = $1
      `, [appointmentId]);
    }

    logger.info({ message: 'Cita cancelada exitosamente', appointmentId, calendarDeleted });

    // 5. Notificar al paciente por correo
    let emailSent = false;
    if (appointment.client_email) {
      try {
        const emailRes = await sendCancellationEmail(
          appointment.client_email,
          appointment.client_name,
          new Date(appointment.appointment_date),
          reason
        );
        emailSent = !!emailRes;
      } catch (emailErr: any) {
        logger.warn({ message: 'No se pudo enviar correo de cancelación', error: emailErr?.message });
      }
    }

    return {
      success: true,
      appointmentId,
      calendarDeleted,
      emailSent,
    };
  } catch (error: any) {
    console.error('Error detallado al cancelar cita:', error);
    logger.error('[Appointments Error]: Error al cancelar cita', error?.message || error);
    throw error;
  }
}
