import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '../../../../lib/api-handler';
import { getActiveSubscription } from '../../../../services/subscriptions';
import { createAppointment } from '../../../../services/appointments';
import { logger } from '../../../../lib/logger';
import { requireAdminSession } from '../../../../lib/auth';
import { query } from '../../../../lib/db';

const scheduleSchema = z.object({
  clientId: z.string().uuid(),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  date: z.string().datetime(),
});

async function postHandler(request: Request) {
  const body = await request.json();
  const parsed = scheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
  }

  const { clientId, clientName, clientEmail, date } = parsed.data;

  // 1. Verificar si la petición proviene de un administrador autenticado
  const adminSession = await requireAdminSession();

  // 2. Mitigación de IDOR: verificar existencia y propiedad del recurso
  const userCheck = await query(
    'SELECT id, email, full_name FROM users WHERE id = $1',
    [clientId]
  );

  if (userCheck.rows.length === 0) {
    return NextResponse.json({ 
      success: false, 
      message: 'Cliente no encontrado' 
    }, { status: 404 });
  }

  const existingUser = userCheck.rows[0];

  // Si no es admin, validar correspondencia estricta de email para prevenir suplantación/IDOR
  if (!adminSession) {
    if (existingUser.email.toLowerCase() !== clientEmail.toLowerCase().trim()) {
      logger.warn({
        message: 'Intento de acceso no autorizado (posible IDOR) detectado en agendamiento',
        requestedClientId: clientId,
        requestedEmail: clientEmail,
        actualEmail: existingUser.email
      });
      return NextResponse.json({
        success: false,
        message: 'No tienes autorización para agendar citas en nombre de este usuario.'
      }, { status: 403 });
    }
  }

  // 3. Verificar que tenga una suscripción activa
  const activeSub = await getActiveSubscription(clientId);
  
  if (!activeSub) {
    return NextResponse.json({ 
      success: false, 
      message: 'No tienes sesiones disponibles en este momento. Adquiere un nuevo plan.' 
    }, { status: 403 });
  }

  // 4. Agendar la cita (esto descontará la sesión automáticamente gracias al servicio)
  const result = await createAppointment({
    clientId,
    clientName,
    clientEmail,
    date: new Date(date),
    isFreeConsultation: false,
    subscriptionId: activeSub.id,
  });

  logger.info({ message: 'Cita de seguimiento agendada', appointmentId: result.appointmentId });

  return NextResponse.json({
    success: true,
    message: 'Cita agendada exitosamente. Te hemos enviado un correo de confirmación.',
    appointmentId: result.appointmentId,
    sessionsRemaining: activeSub.sessions_remaining - 1, // Se descuenta en tiempo real
  });
}

export const POST = withErrorHandler(postHandler);
