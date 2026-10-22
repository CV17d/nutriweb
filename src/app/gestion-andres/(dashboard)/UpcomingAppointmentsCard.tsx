'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export interface AppointmentItem {
  id: string;
  appointment_date: string | Date;
  status: string;
  is_free_consultation: boolean;
  created_at?: string;
  client_name: string;
  client_email: string;
}

interface UpcomingAppointmentsCardProps {
  initialAppointments: AppointmentItem[];
  upcomingAppointmentsCount: number;
}

function formatBogotaDateTime(dateValue: string | Date | null) {
  if (!dateValue) return 'Sin fecha';
  try {
    const d = new Date(dateValue);
    return d.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Fecha inválida';
  }
}

export default function UpcomingAppointmentsCard({
  initialAppointments,
  upcomingAppointmentsCount,
}: UpcomingAppointmentsCardProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [count, setCount] = useState<number>(upcomingAppointmentsCount);
  const [selectedToCancel, setSelectedToCancel] = useState<AppointmentItem | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const handleOpenCancelModal = (appointment: AppointmentItem) => {
    setSelectedToCancel(appointment);
    setCancelReason('');
  };

  const handleCloseCancelModal = () => {
    if (isSubmitting) return;
    setSelectedToCancel(null);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedToCancel) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/appointments/${selectedToCancel.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() || undefined }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        showToast('Tu sesión ha expirado. Redirigiendo...', 'error');
        window.location.href = '/gestion-andres/login?reason=expired';
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Error al cancelar la cita');
      }

      // 1. Quitar la cita de la lista local
      setAppointments((prev) => prev.filter((a) => a.id !== selectedToCancel.id));
      setCount((prev) => Math.max(0, prev - 1));

      // 2. Cerrar el modal
      setSelectedToCancel(null);
      setCancelReason('');

      // 3. Notificación de éxito
      showToast('Cita cancelada y horario liberado en Google Calendar', 'success');

      // 4. Refrescar el dashboard del servidor para actualizar KPIs
      router.refresh();
    } catch (error: any) {
      console.error('Error al cancelar cita:', error);
      showToast(error.message || 'Error de conexión al cancelar la cita', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast Flotante */}
      {feedback && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-up bg-surface-container-lowest text-on-surface">
          <span
            className={`material-symbols-outlined text-[22px] ${
              feedback.type === 'success' ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-xs font-medium leading-relaxed">{feedback.message}</p>
          <button
            onClick={() => setFeedback(null)}
            className="text-on-surface-variant hover:text-on-surface ml-auto text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Widget de Próximas Citas */}
      <div className="bg-brand-navy rounded-2xl p-6 text-on-primary shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline-md text-base md:text-lg font-bold flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-brand-electric">schedule</span>
            Próximas Citas
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/10">
            {count} {count === 1 ? 'agendada' : 'agendadas'}
          </span>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-6 px-4 rounded-xl bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-[32px] text-white/30 mb-1">
                event_available
              </span>
              <p className="text-xs text-white/70 font-medium">
                No hay citas próximas programadas.
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">
                Los horarios cancelados o disponibles se sincronizan en tiempo real.
              </p>
            </div>
          ) : (
            appointments.map((app) => {
              const isFree = app.is_free_consultation;
              const dateStr = formatBogotaDateTime(app.appointment_date);

              return (
                <div
                  key={app.id}
                  className="bg-white/10 hover:bg-white/[0.14] rounded-xl p-3.5 border border-white/10 backdrop-blur-sm transition-colors group relative"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="font-bold text-xs text-white tracking-wide">{dateStr}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                          isFree ? 'bg-amber-400/20 text-amber-300' : 'bg-brand-electric text-white'
                        }`}
                      >
                        {isFree ? 'Gratuita' : 'Plan'}
                      </span>

                      {/* Botón Acción Cancelar Cita */}
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(app)}
                        className="opacity-70 group-hover:opacity-100 hover:opacity-100 p-1 text-white/50 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Cancelar esta cita y liberar horario en Google Calendar"
                      >
                        <span className="material-symbols-outlined text-[16px]">event_busy</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/90 text-xs font-semibold leading-tight">
                        {app.client_name}
                      </p>
                      {app.client_email && (
                        <p className="text-white/50 text-[11px] truncate max-w-[200px]">
                          {app.client_email}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenCancelModal(app)}
                      className="text-[11px] font-medium text-red-300/80 hover:text-red-300 hover:underline flex items-center gap-0.5 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Link
          href="/gestion-andres/patients"
          prefetch={false}
          className="w-full mt-5 py-2.5 px-4 bg-brand-electric hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          Ver Pacientes y Citas
        </Link>
      </div>

      {/* Modal de Confirmación de Cancelación */}
      {selectedToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">event_busy</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  ¿Cancelar esta cita?
                </h3>
                <p className="text-xs text-gray-500">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Paciente:</span>
                <span className="font-bold text-gray-900">{selectedToCancel.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha y Hora:</span>
                <span className="font-semibold text-gray-900">
                  {formatBogotaDateTime(selectedToCancel.appointment_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo:</span>
                <span className="font-medium text-gray-800">
                  {selectedToCancel.is_free_consultation ? 'Consulta Gratuita' : 'Sesión de Plan'}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <strong>Sincronización automática:</strong> El evento se eliminará de Google Calendar, el horario quedará inmediatamente disponible para nuevos pacientes y se notificará por correo.
            </div>

            <div>
              <label htmlFor="cancel-reason" className="block text-xs font-semibold text-gray-700 mb-1">
                Motivo de la cancelación (opcional):
              </label>
              <textarea
                id="cancel-reason"
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej. Solicitud del paciente, reprogramación o imprevisto..."
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-electric focus:border-transparent text-gray-900"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                No, conservar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Sí, cancelar cita
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
