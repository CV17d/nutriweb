"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

registerLocale('es', es);

interface SubscriptionInfo {
  id: string;
  planName: string;
  clientName: string;
  sessionsRemaining: number;
  totalSessions: number;
  sessionsUsed: number;
}

export default function AgendaPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [allowedRange, setAllowedRange] = useState<{ start: Date, end: Date } | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('Virtual');

  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    gcalUrl?: string;
    meetLink?: string | null;
    clinicLink?: string | null;
    appointmentType?: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/agenda/${unwrappedParams.id}/info`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInfo(data.subscription);
          setAllowedRange({
            start: new Date(data.allowedRange.start),
            end: new Date(data.allowedRange.end)
          });
        } else {
          setError(data.message);
        }
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
  }, [unwrappedParams.id]);

  const handleDateChange = async (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime('');
    setAvailableSlots([]);

    if (!date) return;

    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/appointments/availability?date=${dateStr}`);
      const data = await res.json();
      if (data.success) {
        setAvailableSlots(data.availableSlots || []);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;

    setBooking(true);
    try {
      const [hour, minute] = selectedTime.split(':');
      const finalDate = new Date(selectedDate);
      finalDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

      const res = await fetch(`/api/agenda/${unwrappedParams.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: finalDate.toISOString(),
          appointmentType
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingResult({
          gcalUrl: data.gcalUrl,
          meetLink: data.meetLink,
          clinicLink: data.clinicLink,
          appointmentType: data.appointmentType || appointmentType,
        });
        setSuccess(true);
      } else {
        alert(data.message || 'Error al agendar la cita');
      }
    } catch (err) {
      alert('Error de conexión al agendar');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light p-4">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-brand-electric"></div>
      </div>
    );
  }

  if (error || !info || !allowedRange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light px-4 py-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-red-100">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl sm:text-3xl">⚠️</div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    const isPresencial = bookingResult?.appointmentType === 'Presencial';

    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light px-4 py-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-green-100">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 text-2xl sm:text-3xl">✅</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">¡Cita Agendada!</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">Tu sesión ha sido programada con éxito. Hemos enviado la confirmación a tu correo.</p>

          {!isPresencial && bookingResult?.meetLink && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-6 text-left">
              <p className="text-[11px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Enlace de tu videollamada</p>
              <a href={bookingResult.meetLink} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold text-brand-electric hover:underline break-all">
                {bookingResult.meetLink}
              </a>
            </div>
          )}

          {isPresencial && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-6 text-left">
              <p className="text-[11px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Ubicación del consultorio</p>
              <a href={bookingResult?.clinicLink || "https://maps.app.goo.gl/1r8denLgxkjWyQiC8"} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold text-brand-electric hover:underline break-all">
                Consultorio Andrés Burbano - Quito (Ver en Maps)
              </a>
            </div>
          )}

          {bookingResult?.gcalUrl && (
            <a
              href={bookingResult.gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-brand-electric hover:opacity-90 text-white font-bold py-3 sm:py-3.5 px-6 rounded-full transition-opacity flex items-center justify-center gap-2 shadow-md mb-4 text-sm sm:text-base"
            >
              🗓️ Agregar a Google Calendar
            </a>
          )}

          <button onClick={() => router.push('/')} className="w-full bg-transparent border-2 border-gray-200 hover:bg-gray-50 text-brand-navy py-3 px-6 rounded-full font-bold text-sm sm:text-base transition-colors">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light py-6 sm:py-12 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

        <div className="bg-brand-navy p-5 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-electric/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 relative z-10">Tu Agenda Privada</h1>
          <p className="text-xs sm:text-sm text-brand-white/80 relative z-10 leading-relaxed">Hola {info.clientName}, aquí puedes programar tus siguientes sesiones.</p>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl mb-6 sm:mb-8 border border-gray-100">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">Plan Actual</p>
              <p className="text-base sm:text-lg font-bold text-brand-navy">{info.planName}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">Sesiones Restantes</p>
              <p className="text-base sm:text-lg font-bold text-brand-electric">{info.sessionsRemaining} de {info.totalSessions}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-4 flex items-center gap-2">
                <span>1. Elige una Fecha</span>
              </h3>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Basado en tu progreso, puedes agendar en el siguiente rango habilitado:
                <strong> {format(allowedRange.start, 'dd/MM/yyyy')} - {format(allowedRange.end, 'dd/MM/yyyy')}</strong>
              </p>

              <div className="w-full overflow-x-auto flex justify-center border border-gray-200 rounded-xl p-2 bg-white custom-datepicker">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                  locale="es"
                  minDate={allowedRange.start}
                  maxDate={allowedRange.end}
                  filterDate={(date) => date.getDay() !== 0} // Excluir domingos
                />
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-4 flex items-center gap-2">
                <span>2. Modalidad y Hora</span>
              </h3>

              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Modalidad de la Cita</label>
                <div className="flex gap-2.5 sm:gap-3">
                  <label className={`flex-1 cursor-pointer border rounded-xl p-2.5 sm:p-3 text-center transition-colors text-xs sm:text-sm ${appointmentType === 'Virtual' ? 'border-brand-electric bg-brand-electric/5 text-brand-electric font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="radio" name="modality" value="Virtual" className="sr-only" checked={appointmentType === 'Virtual'} onChange={() => setAppointmentType('Virtual')} />
                    💻 Virtual
                  </label>
                  <label className={`flex-1 cursor-pointer border rounded-xl p-2.5 sm:p-3 text-center transition-colors text-xs sm:text-sm ${appointmentType === 'Presencial' ? 'border-brand-electric bg-brand-electric/5 text-brand-electric font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="radio" name="modality" value="Presencial" className="sr-only" checked={appointmentType === 'Presencial'} onChange={() => setAppointmentType('Presencial')} />
                    🏢 Presencial
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 text-center">⚠️ Recuerda que todos los planes exigen al menos 1 cita presencial obligatoria.</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Horarios Disponibles</label>

                {!selectedDate ? (
                  <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    <p className="text-sm">Selecciona una fecha primero</p>
                  </div>
                ) : loadingSlots ? (
                  <div className="flex justify-center p-6 border border-gray-100 rounded-xl">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-electric"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center p-6 border border-orange-100 bg-orange-50 rounded-xl text-orange-600">
                    <p className="text-sm font-medium">No hay horarios este día</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedTime === time
                          ? 'bg-brand-navy text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-navy hover:text-brand-navy'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 border-t border-gray-100 pt-6 sm:pt-8 text-center">
            <button
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime || booking}
              className="bg-brand-electric text-white px-6 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none w-full md:w-auto min-w-0 sm:min-w-[250px]"
            >
              {booking ? 'Confirmando Cita...' : 'Confirmar Cita'}
            </button>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-datepicker .react-datepicker {
          border: none;
          font-family: inherit;
        }
        .custom-datepicker .react-datepicker__header {
          background-color: white;
          border-bottom: none;
          padding-top: 15px;
        }
        .custom-datepicker .react-datepicker__current-month {
          color: #1a202c;
          font-weight: 800;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }
        .custom-datepicker .react-datepicker__day--selected,
        .custom-datepicker .react-datepicker__day--keyboard-selected {
          background-color: #0052FF;
          color: white;
          border-radius: 50%;
        }
        .custom-datepicker .react-datepicker__day:hover {
          border-radius: 50%;
        }
        .custom-datepicker .react-datepicker__day--disabled {
          color: #cbd5e0;
          text-decoration: line-through;
        }
      ` }} />
    </div>
  );
}
