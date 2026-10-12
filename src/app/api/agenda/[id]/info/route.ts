import { NextResponse } from 'next/server';
import { getSubscriptionById } from '../../../../../services/subscriptions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const subscription = await getSubscriptionById(id);
    if (!subscription) {
      return NextResponse.json({ success: false, message: 'Enlace no válido o suscripción no encontrada' }, { status: 404 });
    }

    if (subscription.status !== 'active' || subscription.sessions_remaining <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No te quedan sesiones disponibles en este plan o el plan ha expirado.',
        subscription
      }, { status: 400 });
    }

    // Calcular el rango de fechas permitido (Plazo)
    const createdAt = new Date(subscription.created_at);
    const totalSessions = subscription.total_sessions;
    const sessionsUsed = subscription.sessions_used;

    // Fórmula: 90 días totales divididos por el número de intervalos (total - 1)
    const intervalDays = totalSessions > 1 ? 90 / (totalSessions - 1) : 0;
    
    // Idealmente, en qué día debería ser esta cita
    const idealDayOffset = sessionsUsed * intervalDays;
    
    // Definimos una ventana de +/- 7 días desde la fecha ideal para dar flexibilidad
    const windowDays = 7;
    
    const allowedStart = new Date(createdAt);
    allowedStart.setDate(allowedStart.getDate() + idealDayOffset - windowDays);
    
    const allowedEnd = new Date(createdAt);
    allowedEnd.setDate(allowedEnd.getDate() + idealDayOffset + windowDays);

    // Nunca permitir agendar en el pasado, la fecha de inicio mínima es hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const actualStart = allowedStart < today ? today : allowedStart;

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        planName: subscription.plan_name,
        clientName: subscription.client_name,
        sessionsRemaining: subscription.sessions_remaining,
        totalSessions: subscription.total_sessions,
        sessionsUsed: subscription.sessions_used,
      },
      allowedRange: {
        start: actualStart.toISOString(),
        end: allowedEnd.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching agenda info:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}
