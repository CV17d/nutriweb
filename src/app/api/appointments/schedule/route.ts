import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '../../../../lib/api-handler';
import { getActiveSubscription } from '../../../../services/subscriptions';
import { createAppointment } from '../../../../services/appointments';
import { logger } from '../../../../lib/logger';

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

  // 1. Verificar que tenga una suscripción activa
  const activeSub = await getActiveSubscription(clientId);
  
  if (!activeSub) {
    return NextResponse.json({ 
      success: false, 
      message: 'No tienes sesiones disponibles en este momento. Adquiere un nuevo plan.' 
    }, { status: 403 });
  }

  // 2. Agendar la cita (esto descontará la sesión automáticamente gracias al servicio)
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
