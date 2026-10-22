import { google } from 'googleapis';
import { logger } from '../lib/logger';
import crypto from 'crypto';

// Validamos variables esenciales para Calendar (sólo avisar en consola si no existen)
if (!process.env.GOOGLE_CALENDAR_CLIENT_EMAIL || !process.env.GOOGLE_CALENDAR_PRIVATE_KEY) {
  logger.warn('Credenciales de Google Calendar incompletas. Las llamadas fallarán.');
}

// Reemplazar saltos de línea escapados (común en variables de entorno)
const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n');

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
});

const calendar = google.calendar({ version: 'v3', auth });

/**
 * Formatea una fecha a formato ISO 8601 con el offset explícito de Colombia (-05:00).
 * Ejemplo: 2026-10-22T10:00:00-05:00
 */
export function formatBogotaISO(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hour = getPart('hour');
  if (hour === '24') hour = '00';
  const minute = getPart('minute');
  const second = getPart('second');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}-05:00`;
}

/**
 * Obtiene la fecha YYYY-MM-DD en la zona horaria de Colombia ('America/Bogota').
 */
export function formatBogotaDateStr(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

export async function createAppointmentEvent(
  clientEmail: string,
  clientName: string,
  date: Date,
  isFreeConsultation: boolean,
  planName?: string,
  appointmentType: string = 'Virtual',
  clientPhone?: string
) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID no está configurado');

    const durationMinutes = 120; // Todas las citas bloquean 2 horas en el calendario (120 mins)
    const endTime = new Date(date.getTime() + durationMinutes * 60000);

    const eventSummary = isFreeConsultation
      ? `Consulta Gratuita (${appointmentType}) - ${clientName}`
      : `Cita de Plan ${planName || 'Nutricional'} (${appointmentType}) - ${clientName}`;

    const isPresencial = appointmentType === 'Presencial';
    const clinicLink = process.env.CLINIC_LOCATION_LINK || 'https://maps.app.goo.gl/1r8denLgxkjWyQiC8';
    const meetLink = process.env.MEET_LINK || '';

    let eventDescription = `Cita agendada a través de la plataforma web.\nModalidad: ${appointmentType}\nCliente: ${clientName}\nEmail: ${clientEmail}${clientPhone ? `\nTeléfono: ${clientPhone}` : ''}${planName ? `\nPlan: ${planName}` : ''}`;

    if (isPresencial) {
      eventDescription += `\nUbicación: ${clinicLink}`;
    } else if (meetLink) {
      eventDescription += `\nEnlace de videollamada: ${meetLink}`;
    }

    const event: any = {
      summary: eventSummary,
      description: eventDescription,
      location: isPresencial ? clinicLink : (meetLink || 'Enlace de videollamada enviado al paciente'),
      start: {
        dateTime: formatBogotaISO(date),
        timeZone: 'America/Bogota',
      },
      end: {
        dateTime: formatBogotaISO(endTime),
        timeZone: 'America/Bogota',
      },
      reminders: {
        useDefault: true,
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: event,
    });

    logger.info({ message: 'Evento de Google Calendar creado', eventId: response.data.id });

    // Extraemos el enlace de Google Meet si existe
    const hangoutLink = response.data.hangoutLink || '';

    return { ...response.data, hangoutLink };
  } catch (error: any) {
    console.error('Error detallado al agendar (Google Calendar createAppointmentEvent):', error);
    logger.error('[GoogleCalendar Error]: Error al crear el evento en Google Calendar', error?.message || error);
    throw error;
  }
}

export async function getBusySlots(dateStr: string) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) return [];

    // dateStr representa YYYY-MM-DD en hora de Colombia (America/Bogota, UTC-5)
    // Cubrimos el día completo de 00:00 a 23:59:59.999 en hora de Bogotá
    const timeMin = new Date(`${dateStr}T00:00:00-05:00`).toISOString();
    const timeMax = new Date(`${dateStr}T23:59:59.999-05:00`).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      timeZone: 'America/Bogota',
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    return events.map(event => {
      const startStr = event.start?.dateTime || (event.start?.date ? `${event.start.date}T00:00:00-05:00` : null);
      const endStr = event.end?.dateTime || (event.end?.date ? `${event.end.date}T23:59:59-05:00` : null);
      return {
        start: startStr ? new Date(startStr) : null,
        end: endStr ? new Date(endStr) : null,
      };
    }).filter((slot): slot is { start: Date; end: Date } => 
      slot.start !== null && slot.end !== null && !isNaN(slot.start.getTime()) && !isNaN(slot.end.getTime())
    );
  } catch (error: any) {
    console.error('Error detallado al agendar (Google Calendar getBusySlots):', error);
    logger.error('[GoogleCalendar Error]: Error consultando disponibilidad en Google Calendar', error?.message || error);
    return []; // Fallback a mostrar todos los horarios si la API falla
  }
}

/**
 * Elimina un evento de Google Calendar por su eventId.
 * No arroja error si el evento ya fue eliminado previamente (404/410).
 */
export async function deleteAppointmentEvent(eventId: string): Promise<boolean> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    await calendar.events.delete({
      calendarId,
      eventId,
    });
    logger.info({ message: 'Evento de Google Calendar eliminado con éxito', eventId });
    return true;
  } catch (error: any) {
    const status = error.code || error.status || error?.response?.status;
    if (status === 404 || status === 410) {
      console.warn('El evento ya no existía en Google Calendar:', eventId);
      logger.warn({ message: 'El evento ya no existía en Google Calendar al intentar eliminarlo', eventId });
      return true;
    }
    console.error('Error al eliminar evento en Google Calendar:', error);
    logger.error('[GoogleCalendar Error]: Error al eliminar evento', error?.message || error);
    return false;
  }
}

/**
 * Busca y elimina un evento en Google Calendar por fecha y nombre/correo del paciente.
 * Útil como fallback para citas antiguas que no tengan google_event_id guardado.
 */
export async function findAndDeleteEventByDate(date: Date, clientIdentifier?: string): Promise<boolean> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const timeMin = new Date(date.getTime() - 15 * 60000).toISOString();
    const timeMax = new Date(date.getTime() + 15 * 60000).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
    });

    const events = response.data.items || [];
    for (const evt of events) {
      if (evt.id) {
        const matchesIdentifier = !clientIdentifier ||
          (evt.summary && evt.summary.toLowerCase().includes(clientIdentifier.toLowerCase())) ||
          (evt.description && evt.description.toLowerCase().includes(clientIdentifier.toLowerCase())) ||
          events.length === 1;

        if (matchesIdentifier) {
          await deleteAppointmentEvent(evt.id);
          return true;
        }
      }
    }
    return false;
  } catch (err: any) {
    console.warn('No se pudo buscar/eliminar evento por fecha en Google Calendar:', err?.message || err);
    return false;
  }
}

