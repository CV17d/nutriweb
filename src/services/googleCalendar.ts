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

    const eventDescription = `Cita agendada a través de la plataforma web.\nModalidad: ${appointmentType}\nCliente: ${clientName}\nEmail: ${clientEmail}${clientPhone ? `\nTeléfono: ${clientPhone}` : ''}${planName ? `\nPlan: ${planName}` : ''}`;

    const event: any = {
      summary: eventSummary,
      description: eventDescription,
      location: appointmentType === 'Presencial' ? (process.env.CLINIC_LOCATION_LINK || 'Consultorio Médico') : (process.env.MEET_LINK || 'Enlace de videollamada enviado al paciente'),
      start: {
        dateTime: date.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      },
      reminders: {
        useDefault: true,
      },
    };

    /*
    // Deshabilitado: Google Calendar API no permite generar enlaces de Meet automáticamente
    // a través de Service Accounts a menos que tengan Google Workspace (G Suite).
    // Con cuentas @gmail.com gratuitas arroja "Invalid conference type value".
    if (appointmentType === 'Virtual') {
      event.conferenceData = {
        createRequest: {
          requestId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      };
    }
    */

    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: event,
    });

    logger.info({ message: 'Evento de Google Calendar creado', eventId: response.data.id });
    
    // Extraemos el enlace de Google Meet si existe
    const hangoutLink = response.data.hangoutLink || '';
    
    return { ...response.data, hangoutLink };
  } catch (error) {
    logger.error('Error al crear el evento en Google Calendar', error);
    throw error;
  }
}

export async function getBusySlots(dateStr: string) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) return [];

    const [year, month, day] = dateStr.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(year, month - 1, day);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    return events.map(event => ({
      start: event.start?.dateTime ? new Date(event.start.dateTime) : null,
      end: event.end?.dateTime ? new Date(event.end.dateTime) : null,
    })).filter(slot => slot.start && slot.end);
  } catch (error) {
    logger.error('Error consultando disponibilidad en Google Calendar', error);
    return []; // Fallback a mostrar todos los horarios si la API falla
  }
}

