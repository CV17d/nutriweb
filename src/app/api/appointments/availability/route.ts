import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBusySlots } from '../../../../services/googleCalendar';
import { query } from '../../../../lib/db';
import { logger } from '../../../../lib/logger';
import { withErrorHandler } from '../../../../lib/api-handler';

const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Debe ser YYYY-MM-DD');

function isSlotAvailable(slot: string, dateStr: string, busySlots: { start: Date; end: Date }[]) {
  const [time, period] = slot.split(" ");
  const [parsedHours, minutes] = time.split(":").map(Number);
  let hours = parsedHours;
  
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const pad = (n: number) => String(n).padStart(2, '0');
  // Anclamos el inicio del slot explícitamente a la zona horaria de Colombia (America/Bogota, UTC-5)
  const slotStart = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00-05:00`);

  // Consideramos que un slot dura 2 horas (120 mins) para evitar cruces
  const slotEnd = new Date(slotStart.getTime() + 120 * 60000);

  // Evitar agendar en fechas u horas del pasado usando comparación de timestamps absolutos
  if (slotStart.getTime() <= Date.now()) {
    return false;
  }

  // Revisar si se cruza con algún evento ocupado (de Google Calendar o Supabase)
  for (const busy of busySlots) {
    if (slotStart.getTime() < busy.end.getTime() && slotEnd.getTime() > busy.start.getTime()) {
      return false; // Está ocupado
    }
  }

  return true;
}

async function getHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json({ success: false, message: 'El parámetro de fecha es requerido' }, { status: 400 });
    }

    const parsedDate = dateParamSchema.safeParse(dateStr);
    if (!parsedDate.success) {
      return NextResponse.json({ success: false, message: 'Formato de fecha inválido. Debe ser YYYY-MM-DD' }, { status: 400 });
    }

    // Usar mediodía en hora de Bogotá para calcular el día de la semana sin problemas de offset
    const selectedDate = new Date(`${dateStr}T12:00:00-05:00`);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Fecha de calendario inválida' }, { status: 400 });
    }

    const dayOfWeek = selectedDate.getDay();

    // Bloquear domingos
    if (dayOfWeek === 0) {
      return NextResponse.json({ success: true, availableSlots: [] });
    }

    // Definir horarios según el día de la semana
    let TIME_SLOTS: string[] = [];
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Lunes a Viernes: 8:00 AM - 5:00 PM (cada 2 horas, permitiendo última a las 4 PM)
      TIME_SLOTS = ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];
    } else if (dayOfWeek === 6) {
      // Sábados: 9:00 AM - 3:00 PM (cada 2 horas)
      TIME_SLOTS = ["09:00 AM", "11:00 AM", "01:00 PM"];
    }

    // 1. Obtener eventos ocupados de Google Calendar proyectados sobre America/Bogota
    const busyFromGCal = await getBusySlots(dateStr);

    // 2. Obtener citas ocupadas de Supabase / PostgreSQL para esa fecha
    // Las citas 'unverified' solo bloquean temporalmente (máximo 30 minutos desde su creación)
    const dayStart = new Date(`${dateStr}T00:00:00-05:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999-05:00`);

    const dbRes = await query(
      `SELECT appointment_date FROM appointments 
       WHERE appointment_date >= $1 AND appointment_date <= $2 
       AND (
         status = 'scheduled'
         OR (status = 'unverified' AND created_at >= NOW() - INTERVAL '30 minutes')
       )`,
      [dayStart.toISOString(), dayEnd.toISOString()]
    );

    const busyFromDb = dbRes.rows.map((row: any) => {
      const start = new Date(row.appointment_date);
      const end = new Date(start.getTime() + 120 * 60000); // 2 horas
      return { start, end };
    });

    const allBusy = [...busyFromGCal, ...busyFromDb];
    const validBusySlots = allBusy.filter(
      (slot): slot is { start: Date; end: Date } =>
        slot.start !== null && slot.end !== null && !isNaN(slot.start.getTime()) && !isNaN(slot.end.getTime())
    );

    // Filtramos los TIME_SLOTS base para devolver solo los disponibles
    const availableSlots = TIME_SLOTS.filter(slot => isSlotAvailable(slot, dateStr, validBusySlots));

    return NextResponse.json({
      success: true,
      availableSlots,
    });
  } catch (error: any) {
    console.error('Error detallado al agendar (availability):', error);
    logger.error('[Availability Error]: Error consultando disponibilidad:', error);
    return NextResponse.json({ success: false, message: 'Error consultando disponibilidad', availableSlots: [] }, { status: 500 });
  }
}

export const GET = withErrorHandler(getHandler);
