"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  planId: number;
  planName: string;
  planPrice: number;
  totalSessions: number;
}

export default function CheckoutForm({ planId, planName, planPrice, totalSessions }: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [payphoneReady, setPayphoneReady] = useState(false);
  const [payphoneConfig, setPayphoneConfig] = useState<any>(null);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<"Virtual" | "Presencial">("Virtual");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientIdId: '', // Cédula o RUC
  });
  const [error, setError] = useState('');

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
    setError("");
    setAvailableSlots([]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Cargar hoja de estilos oficial de la Cajita de Pagos Payphone
    const cssId = 'payphone-box-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css';
      document.head.appendChild(link);
    }

    // Cargar SDK JS oficial de la Cajita de Pagos Payphone
    const jsId = 'payphone-box-js';
    if (!document.getElementById(jsId)) {
      const script = document.createElement('script');
      script.id = jsId;
      script.type = 'module';
      script.src = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js';
      document.head.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedDate || !selectedTime || !formData.clientName || !formData.clientEmail || !formData.clientPhone) {
        throw new Error('Por favor, selecciona fecha/hora y completa tus datos de contacto.');
      }

      // Create date from current state
      const dateToSubmit = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
      if (selectedTime) {
        const [time, period] = selectedTime.split(" ");
        const [parsedHours, minutes] = time.split(":").map(Number);
        let hours = parsedHours;
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        dateToSubmit.setHours(hours, minutes, 0, 0);
      }
      
      const firstAppointmentDate = dateToSubmit.toISOString();

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          clientIdId: formData.clientIdId,
          firstAppointmentDate,
          appointmentType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al iniciar el proceso de pago.');
      }

      setPayphoneConfig(data.payphone);
      setPayphoneReady(true);
      setLoading(false);

      // Renderizar el botón de la Cajita de Pagos de Payphone
      setTimeout(() => {
        const clientToken = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN || data.payphone?.token;
        if (typeof window !== 'undefined' && (window as any).PPaymentButtonBox && (clientToken || data.payphone)) {
          const container = document.getElementById('pp-button');
          if (container) {
            container.innerHTML = '';
            try {
              const boxConfig = {
                ...data.payphone,
                ...(clientToken ? { token: clientToken } : {}),
              };
              const ppb = new (window as any).PPaymentButtonBox(boxConfig);
              ppb.render('pp-button');
            } catch (errRender) {
              console.error('Error al renderizar botón de Payphone', errRender);
            }
          }
        }
      }, 300);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
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

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lado Izquierdo: Calendario y Datos */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Paso 1: Calendario Interactivo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#0052FF] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
            <h2 className="text-xl font-bold text-gray-800">Agendar 1ra Consulta</h2>
          </div>
          
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-gray-50">
            {renderCalendar()}

            {selectedDate && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Horarios Disponibles - {selectedDate} {currentDate.toLocaleString("es-ES", { month: "long" })}</p>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4 text-[#0052FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Verificando disponibilidad...
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
                    No hay horarios disponibles este día.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card: Modalidad */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#0052FF] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
              <h2 className="text-xl font-bold text-gray-800">Modalidad de Consulta</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAppointmentType("Virtual")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  appointmentType === "Virtual"
                    ? "border-[#0052FF] bg-blue-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <h3 className="font-bold text-gray-800 mb-1">Cita Virtual</h3>
                <p className="text-xs text-gray-500">Videollamada</p>
              </button>
              
              <button
                type="button"
                onClick={() => setAppointmentType("Presencial")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  appointmentType === "Presencial"
                    ? "border-[#0052FF] bg-blue-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <h3 className="font-bold text-gray-800 mb-1">Cita Presencial</h3>
                <p className="text-xs text-gray-500">En consultorio</p>
              </button>
            </div>
          </div>

        {/* Paso 3: Datos de Facturación */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
            <h2 className="text-xl font-bold text-gray-800">Datos de Facturación</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                name="clientName"
                required
                maxLength={50}
                pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
                title="Solo se permiten letras y espacios"
                placeholder="Ej. Juan Pérez"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
              <input 
                type="tel" 
                name="clientPhone"
                required
                maxLength={20}
                pattern="[\+0-9\s\-]+"
                title="Solo se permiten números, espacios, guiones y el símbolo +"
                placeholder="Ej. +593 99 999 9999"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="clientEmail"
                required
                maxLength={100}
                placeholder="juan@ejemplo.com"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / RUC</label>
              <input 
                type="text" 
                name="clientIdId"
                required
                maxLength={13}
                pattern="\d+"
                title="Solo se permiten números"
                placeholder="17xxxxxxx"
                value={formData.clientIdId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Resumen del Plan */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen del Plan</h2>
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-gray-800">{planName}</h3>
              <p className="text-sm text-gray-500">{totalSessions} Consulta{totalSessions > 1 ? 's' : ''} + Plan Mensual</p>
            </div>
            <span className="font-bold text-blue-600 text-lg">${planPrice}</span>
          </div>

          <div className="text-sm text-gray-500 mb-2">
            Modalidad: <span className="font-medium text-gray-700">{appointmentType}</span>
          </div>

          <hr className="my-6 border-gray-100" />

          {selectedDate && selectedTime && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Fecha Seleccionada</p>
                  <p>{selectedDate} {currentDate.toLocaleString("es-ES", { month: "long" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Hora</p>
                  <p>{selectedTime}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-black text-blue-600">${planPrice.toFixed(2)}</span>
          </div>

          {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

          {!payphoneReady ? (
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all ${(loading || !selectedDate || !selectedTime) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Preparando cajita de pagos...
                </>
              ) : (
                <>
                  Continuar al Pago con Payphone
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Paso Final</p>
                <p className="text-xs text-gray-700">Haz clic en el botón de Payphone a continuación para pagar sin salir de la página:</p>
              </div>

              {payphoneConfig?.token ? (
                <div className="py-2 flex justify-center">
                  <div id="pp-button" className="w-full flex justify-center min-h-[50px]"></div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  <strong>Atención:</strong> Falta configurar la variable <code>PAYPHONE_TOKEN</code> en el archivo <code>.env</code> de tu servidor.
                </div>
              )}

              <button
                type="button"
                onClick={() => setPayphoneReady(false)}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Modificar datos o cita
              </button>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-gray-400 text-xs font-semibold">
              <span className="text-[11px]">Acepta:</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700 font-bold">Visa</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700 font-bold">Mastercard</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700 font-bold">Diners</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700 font-bold">Discover</span>
              <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-bold">Payphone</span>
            </div>
            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 font-medium">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              Cajita de Pagos 100% segura por Payphone
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
