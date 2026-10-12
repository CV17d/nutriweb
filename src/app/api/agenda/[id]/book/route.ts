import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubscriptionById } from '../../../../../services/subscriptions';
import { createAppointment } from '../../../../../services/appointments';
import { sendFinalConfirmationEmail } from '../../../../../services/email';
import { logger } from '../../../../../lib/logger';

const bookSchema = z.object({
  date: z.string().datetime(),
  appointmentType: z.enum(['Presencial', 'Virtual']).default('Virtual'),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = bookSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Datos inválidos', errors: parsed.error.format() }, { status: 400 });
    }

    const { date, appointmentType } = parsed.data;

    const subscription = await getSubscriptionById(id);
    if (!subscription || subscription.status !== 'active' || subscription.sessions_remaining <= 0) {
      return NextResponse.json({ success: false, message: 'La suscripción no es válida o no tiene sesiones disponibles' }, { status: 400 });
    }

    // Al llamar a createAppointment con subscriptionId, se llamará a consumeSession por debajo y se restará 1 sesión.
    const result = await createAppointment({
      clientId: subscription.client_id,
      clientName: subscription.client_name,
      clientEmail: subscription.client_email,
      date: new Date(date),
      isFreeConsultation: false,
      subscriptionId: id,
      appointmentType,
    });

    // Enviar correo final de confirmación con el link a Google Calendar (y Google Meet / Ubicación)
    // Extraemos el meetLink (si lo hubiera generado la API, aunque ahora usamos el .env estático)
    const meetLink = process.env.MEET_LINK || '';
    
    await sendFinalConfirmationEmail(
      subscription.client_email,
      subscription.client_name,
      new Date(date),
      appointmentType,
      meetLink
    );

    return NextResponse.json({
      success: true,
      message: 'Cita agendada con éxito',
      appointmentId: result.appointmentId,
    });

  } catch (error: any) {
    logger.error('Error al agendar cita de agenda privada:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error al procesar la solicitud' }, { status: 500 });
  }
}
