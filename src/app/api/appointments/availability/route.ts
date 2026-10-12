import { NextResponse } from 'next/server';
import { getBusySlots } from '../../../../services/googleCalendar';

function isSlotAvailable(slot: string, dateStr: string, busySlots: { start: Date, end: Date }[]) {
  const [time, period] = slot.split(" ");
  const [parsedHours, minutes] = time.split(":").map(Number);
  let hours = parsedHours;
  
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const [year, month, day] = dateStr.split('-').map(Number);
  const slotStart = new Date(year, month - 1, day);
  slotStart.setHours(hours, minutes, 0, 0);

  // Consideramos que un slot dura 2 horas (120 mins) para evitar cruces
  const slotEnd = new Date(slotStart.getTime() + 120 * 60000);

  // Evitar agendar en fechas u horas del pasado
  const now = new Date();
  if (slotStart < now) {
    return false;
  }

  // Revisar si se cruza con algún evento ocupado
  for (const busy of busySlots) {
    // Si el inicio del slot es antes de que termine el evento ocupado,
    // y el fin del slot es después de que inicie el evento ocupado, hay superposición.
    if (slotStart < busy.end && slotEnd > busy.start) {
      return false; // Está ocupado
    }
  }

  // Si no se cruzó con nada, está disponible
  return true;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');

  if (!dateStr) {
    return NextResponse.json({ success: false, message: 'La fecha es requerida' }, { status: 400 });
  }

  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
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

    const busySlots = await getBusySlots(dateStr);
    
    // Filtramos los TIME_SLOTS base para devolver solo los disponibles
    const validBusySlots = busySlots.filter((slot): slot is { start: Date; end: Date } => slot.start !== null && slot.end !== null);
    const availableSlots = TIME_SLOTS.filter(slot => isSlotAvailable(slot, dateStr, validBusySlots));

    return NextResponse.json({
      success: true,
      availableSlots,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
