"use client";

import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";


export default function FreeAppointmentForm() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType] = useState<"Virtual" | "Presencial">("Virtual");
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDateSelect = async (day: number) => {
    setSelectedDate(day);
    setSelectedTime(null);
    setStatus("idle");
    setAvailableSlots([]);
    setErrorMessage("");

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${d}`;
    
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/appointments/availability?date=${dateStr}`);
      const data = await res.json();
      if (data.success) {
        setAvailableSlots(data.availableSlots);
      }
    } catch (err) {
      console.error("Error fetching slots", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setErrorMessage("Por favor, selecciona una fecha y hora.");
      setStatus("error");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      setErrorMessage("Por favor, completa todos los campos.");
      setStatus("error");
      return;
    }

    if (!captchaToken) {
      setErrorMessage("Por favor, verifica que no eres un robot.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const dateToSubmit = new Date(year, month, selectedDate);
      if (selectedTime) {
        const [time, period] = selectedTime.split(" ");
        const [parsedHours, minutes] = time.split(":").map(Number);
        let hours = parsedHours;
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        dateToSubmit.setHours(hours, minutes, 0, 0);
      }
      
      const res = await fetch("/api/appointments/free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateToSubmit.toISOString(),
          time: selectedTime,
          clientName: formData.fullName,
          clientEmail: formData.email,
          phone: formData.phone,
          appointmentType,
          captchaToken,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al agendar la cita");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Ocurrió un error inesperado.");
    }
  };

  const renderCalendar = () => {
    const days = [];
    const daysOfWeek = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth();
    
    // Limitar la navegación a 2 meses en el futuro
    const monthDiff = (currentDate.getFullYear() - today.getFullYear()) * 12 + (currentDate.getMonth() - today.getMonth());
    const isMaxMonth = monthDiff >= 2;

    // Ajustar para que la semana empiece en Lunes
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate === day;
      const dateOfBtn = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isPast = dateOfBtn < today;
      const isSunday = dateOfBtn.getDay() === 0;

      days.push(
        <button
          key={day}
          type="button"
          disabled={isPast || isSunday}
          onClick={() => handleDateSelect(day)}
          className={`h-10 w-10 flex items-center justify-center rounded-full text-sm transition-colors ${
            isPast || isSunday
              ? "text-gray-300 cursor-not-allowed bg-gray-50/50 pointer-events-none opacity-50"
              : isSelected
                ? "bg-[#0052FF] text-white font-medium shadow-md"
                : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6 px-2">
          <button type="button" onClick={handlePrevMonth} disabled={isCurrentMonth} className="p-2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-bold text-gray-800 tracking-wide">
            {currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase())}
          </h3>
          <button type="button" onClick={handleNextMonth} disabled={isMaxMonth} className="p-2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-500">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-2 justify-items-center">
          {days}
        </div>
      </div>
    );
  };

  const getGoogleCalendarUrl = () => {
    if (!selectedDate || !selectedTime) return "#";
    
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate).padStart(2, '0');
    const [hours, minutes] = selectedTime.split(':');
    
    const dateObj = new Date(year, currentDate.getMonth(), selectedDate, parseInt(hours), parseInt(minutes));
    const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000);

    const formatGCalDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g,"");
    };

    const startStr = formatGCalDate(dateObj);
    const endStr = formatGCalDate(endDateObj);
    
    const title = encodeURIComponent("Cita Nutricional - Andrés Burbano");
    const details = encodeURIComponent(`Cita nutricional (${appointmentType}).`);
    const location = encodeURIComponent(appointmentType === "Presencial" ? "Centro de Alto Rendimiento AB, Quito" : "Enlace Virtual (te enviaremos el link)");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      {status === "success" ? (
        <div className="bg-white border border-brand-electric/20 rounded-3xl p-10 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-electric to-blue-400"></div>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-brand-electric mb-6 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-3xl font-extrabold text-brand-navy mb-3 tracking-tight">¡Casi listo! Revisa tu correo</h3>
          <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
            Para evitar el spam, te hemos enviado un correo de confirmación. Por favor, <strong>haz clic en el enlace</strong> de ese correo para confirmar y agendar tu cita definitivamente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              replace
              className="px-8 py-3.5 bg-[#0052FF] text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md inline-block text-center"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Info Banner */}
          <div className="bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl text-sm font-medium flex items-start sm:items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500 mt-0.5 sm:mt-0 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Nota: La cita gratuita de evaluación se realiza de manera 100% virtual. Una vez agendada, te enviaremos el enlace para la videollamada.
          </div>

          {/* Card: Calendar */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Selecciona la Fecha</h2>
            </div>
            
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-gray-50">
              {renderCalendar()}

              {selectedDate && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Horarios Disponibles - {selectedDate} {currentDate.toLocaleString("es-ES", { month: "long" })}</p>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="animate-spin h-4 w-4 text-[#0052FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Verificando disponibilidad en tiempo real...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                            selectedTime === time
                              ? "border-[#0052FF] bg-blue-50 text-[#0052FF]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Lo sentimos, no hay horarios disponibles este día. Por favor, selecciona otro día.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>



          {/* Card: Contact Info */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Datos de Contacto</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 ml-1">Nombre Completo</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all bg-slate-50/50"
                  required
                  maxLength={50}
                  pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
                  title="Solo se permiten letras y espacios"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 ml-1">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej. +593 99 999 9999"
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all bg-slate-50/50"
                  required
                  maxLength={20}
                  pattern="[\+0-9\s\-]+"
                  title="Solo se permiten números, espacios, guiones y el símbolo +"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-600 ml-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@ejemplo.com"
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all bg-slate-50/50"
                  required
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {status === "error" && (
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
              onChange={(token) => setCaptchaToken(token)}
            />
            
            <button
              type="submit"
              disabled={status === "loading" || !selectedDate || !selectedTime || !captchaToken}
              className="px-8 py-4 bg-[#0052FF] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar y Agendar Cita
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
