import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubscriptionById } from '../../../../../services/subscriptions';
import { createAppointment } from '../../../../../services/appointments';
import { sendFinalConfirmationEmail } from '../../../../../services/email';
import { withErrorHandler } from '../../../../../lib/api-handler';

const bookSchema = z.object({
  date: z.string().datetime(),
  appointmentType: z.enum(['Presencial', 'Virtual']).default('Virtual'),
});

async function bookHandler(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ success: false, message: 'Identificador de agenda inválido' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = bookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Datos inválidos', errors: parsed.error.format() }, { status: 400 });
  }

  const { date, appointmentType } = parsed.data;

  const subscription = await getSubscriptionById(idParsed.data);
  if (!subscription || subscription.status !== 'active' || subscription.sessions_remaining <= 0) {
    return NextResponse.json({ success: false, message: 'La suscripción no es válida o no tiene sesiones disponibles' }, { status: 400 });
  }

  const result = await createAppointment({
    clientId: subscription.client_id,
    clientName: subscription.client_name,
    clientEmail: subscription.client_email,
    date: new Date(date),
    isFreeConsultation: false,
    subscriptionId: idParsed.data,
    appointmentType,
  });

  const meetLink = process.env.MEET_LINK || '';
  const clinicLink = process.env.CLINIC_LOCATION_LINK || 'https://maps.app.goo.gl/1r8denLgxkjWyQiC8';
  const isPresencial = appointmentType === 'Presencial';

  const endTime = new Date(new Date(date).getTime() + 120 * 60000); // 2 horas
  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const startStr = formatGCalDate(new Date(date));
  const endStr = formatGCalDate(endTime);

  const title = encodeURIComponent("Cita Nutricional - Andrés Burbano");
  const details = encodeURIComponent(
    isPresencial
      ? `Cita nutricional (Presencial).\nUbicación: ${clinicLink}`
      : `Cita nutricional (Virtual).${meetLink ? `\nEnlace de reunión: ${meetLink}` : ''}`
  );
  const location = encodeURIComponent(isPresencial ? clinicLink : meetLink);
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

  return NextResponse.json({
    success: true,
    message: 'Cita agendada con éxito',
    appointmentId: result.appointmentId,
    gcalUrl,
    meetLink: isPresencial ? null : meetLink,
    clinicLink: isPresencial ? clinicLink : null,
    appointmentType,
  });
}

export const POST = withErrorHandler(bookHandler);
