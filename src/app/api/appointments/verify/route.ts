import { NextResponse } from 'next/server';
import { confirmFreeAppointment } from '../../../../services/appointments';
import { logger } from '../../../../lib/logger';
import { withErrorHandler } from '../../../../lib/api-handler';

async function verifyHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawToken = searchParams.get('token') || searchParams.get('id');

  if (!rawToken || typeof rawToken !== 'string' || !rawToken.trim()) {
    console.error('Error detallado en verificación de cita: Parámetro "token" o "id" ausente en la URL.');
    return NextResponse.redirect(new URL('/verify-success?error=missing_token', request.url));
  }

  const token = rawToken.trim();

  try {
    const appointment = await confirmFreeAppointment(token);

    // Generar el enlace de Google Calendar
    const meetLink = process.env.MEET_LINK || '';
    const clinicLink = process.env.CLINIC_LOCATION_LINK || 'https://maps.app.goo.gl/1r8denLgxkjWyQiC8';
    const isPresencial = appointment.type === 'Presencial';

    const endTime = new Date(appointment.date.getTime() + 120 * 60000); // 2 horas
    const formatGCalDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const startStr = formatGCalDate(appointment.date);
    const endStr = formatGCalDate(endTime);

    const title = encodeURIComponent("Cita Nutricional - Andrés Burbano");
    const details = encodeURIComponent(
      isPresencial
        ? `Cita nutricional (Presencial).\nUbicación: ${clinicLink}`
        : `Cita nutricional (Virtual).${meetLink ? `\nEnlace de reunión: ${meetLink}` : ''}`
    );
    const location = encodeURIComponent(isPresencial ? clinicLink : meetLink);

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

    // Redirigir a la página de éxito pasando el enlace y modalidad
    return NextResponse.redirect(new URL(`/verify-success?status=success&gcalUrl=${encodeURIComponent(gcalUrl)}&type=${encodeURIComponent(appointment.type || 'Virtual')}`, request.url));
  } catch (error: any) {
    console.error('Error detallado en verificación de cita:', error);
    logger.error('[Appointments Error]: Error al verificar la cita', error?.message || error);
    return NextResponse.redirect(new URL('/verify-success?error=invalid_token', request.url));
  }
}

export const GET = withErrorHandler(verifyHandler);
