"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BankModal from './BankModal';

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
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const isNoInterestEligible = planPrice >= 200;
  
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
  const [paymentMethod, setPaymentMethod] = useState<'contado' | 'diferido'>('contado');
  const [installments, setInstallments] = useState<number>(3);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

      if (!acceptedTerms) {
        throw new Error('Debes aceptar los Términos de Servicio, Políticas de Privacidad y Reembolsos para continuar.');
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
          paymentType: paymentMethod === 'diferido' ? 'deferred' : 'current',
          installments: paymentMethod === 'diferido' ? installments : 1,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al iniciar el proceso de pago.');
      }

      const clientToken = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN || data.payphone?.token || '';
      const finalPayphoneConfig = {
        ...data.payphone,
        token: clientToken,
      };

      setPayphoneConfig(finalPayphoneConfig);
      setPayphoneReady(true);
      setLoading(false);

      // Renderizar el botón de la Cajita de Pagos de Payphone
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).PPaymentButtonBox && clientToken) {
          const container = document.getElementById('pp-button');
          if (container) {
            container.innerHTML = '';
            try {
              const ppb = new (window as any).PPaymentButtonBox(finalPayphoneConfig);
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
      days.push(<div key={`empty-${i}`} className="h-9 w-9 sm:h-10 sm:w-10"></div>);
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
          className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full text-xs sm:text-sm transition-colors ${
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
      <div className="w-full overflow-x-auto">
        <div className="min-w-[280px]">
          <div className="flex justify-between items-center mb-6 px-2">
            <button type="button" onClick={handlePrevMonth} disabled={isCurrentMonth} className="p-2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 tracking-wide">
              {currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase())}
            </h3>
            <button type="button" onClick={handleNextMonth} disabled={isMaxMonth} className="p-2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-semibold text-gray-500">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-3 sm:gap-y-4 gap-x-1 sm:gap-x-2 justify-items-center">
            {days}
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Lado Izquierdo: Calendario y Datos */}
      <div className="lg:col-span-2 space-y-6 sm:space-y-8">
        
        {/* Paso 1: Calendario Interactivo */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#0052FF] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Agendar 1ra Consulta</h2>
          </div>
          
          <div className="bg-slate-50/50 rounded-2xl p-3 sm:p-6 border border-gray-50 overflow-x-auto">
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
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border ${
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
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#0052FF] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Modalidad de Consulta</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <button
              type="button"
              onClick={() => setAppointmentType("Virtual")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                appointmentType === "Virtual"
                  ? "border-[#0052FF] bg-blue-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Cita Virtual</h3>
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
              <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Cita Presencial</h3>
              <p className="text-xs text-gray-500">En consultorio</p>
            </button>
          </div>
        </div>

        {/* Paso 3: Datos de Facturación */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Datos de Facturación</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
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
                className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
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
                className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="clientEmail"
                required
                maxLength={100}
                placeholder="juan@ejemplo.com"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Cédula / RUC</label>
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
                className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Paso 4: Método de Pago */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">4</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Método de Pago</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("contado")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === "contado"
                    ? "border-[#0052FF] bg-blue-50/70 shadow-sm"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Pago de Contado</h3>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'contado' ? 'border-[#0052FF]' : 'border-gray-300'}`}>
                    {paymentMethod === 'contado' && <div className="w-2 h-2 rounded-full bg-[#0052FF]" />}
                  </div>
                </div>
                <p className="text-xs text-gray-500">1 solo pago con tarjeta de débito o crédito</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("diferido")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === "diferido"
                    ? "border-[#0052FF] bg-blue-50/70 shadow-sm"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Pago Diferido (Tarjeta de Crédito)</h3>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'diferido' ? 'border-[#0052FF]' : 'border-gray-300'}`}>
                    {paymentMethod === 'diferido' && <div className="w-2 h-2 rounded-full bg-[#0052FF]" />}
                  </div>
                </div>
                <p className="text-xs text-gray-500">Paga en cuotas mensuales</p>
              </button>
            </div>

            {/* Selector de meses si elige diferido */}
            {paymentMethod === "diferido" && (
              <div className="mt-4 p-4 bg-slate-50 border border-blue-100 rounded-2xl space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800">
                    Selecciona el plazo de diferido:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsBankModalOpen(true)}
                    className="text-xs font-bold text-brand-electric hover:underline flex items-center gap-1 w-fit"
                  >
                    <span>Ver bancos aceptados</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-sm">
                  {[1, 2, 3].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setInstallments(months)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all text-center ${
                        installments === months
                          ? "bg-[#0052FF] text-white border-[#0052FF] shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="block">{months} {months === 1 ? 'cuota' : 'cuotas'}</span>
                      <span className={`block text-[11px] font-normal mt-0.5 ${installments === months ? 'text-blue-100' : 'text-gray-500'}`}>
                        (~${(planPrice / months).toFixed(2)}/mes)
                      </span>
                    </button>
                  ))}
                </div>

                {/* Aclaración según monto mínimo de Payphone */}
                {isNoInterestEligible ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <span className="text-emerald-600 text-sm">✓</span>
                      <span>Diferido SIN INTERESES disponible (Monto ≥ $200 USD)</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      Este plan aplica a diferido de <strong>hasta 3 cuotas sin intereses</strong> con tarjetas de crédito de bancos locales participantes (Pichincha, Diners Club, BGR, Interdin, etc.).
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      *Si tu tarjeta pertenece a una entidad no convenida para tasa 0%, el diferido se procesará con las condiciones de tu banco emisor.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <span className="text-amber-600 text-sm">ℹ️</span>
                      <span>Diferido CON INTERESES (Monto &lt; $200 USD)</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      Para este plan de <strong>${planPrice.toFixed(2)} USD</strong> (monto inferior al umbral de $200 USD exigido por Payphone para diferidos sin recargo), las cuotas se procesan <strong>con intereses</strong> según la tasa y condiciones de tu banco emisor.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lado Derecho: Resumen del Plan */}
      <div className="lg:col-span-1">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Resumen del Plan</h2>
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{planName}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{totalSessions} Consulta{totalSessions > 1 ? 's' : ''} + Plan Mensual</p>
            </div>
            <span className="font-bold text-blue-600 text-base sm:text-lg">${planPrice}</span>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 mb-2">
            Modalidad: <span className="font-medium text-gray-700">{appointmentType}</span>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 mb-2">
            Método de cobro: <span className="font-medium text-gray-700">
              {paymentMethod === 'diferido' 
                ? `Diferido (${installments} ${installments === 1 ? 'cuota' : 'cuotas'} - ${isNoInterestEligible ? 'Sin intereses*' : 'Con intereses*'})` 
                : 'Contado (1 pago)'}
            </span>
          </div>

          {paymentMethod === 'diferido' && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-2 font-medium ${isNoInterestEligible ? 'text-emerald-800 bg-emerald-50 border border-emerald-100' : 'text-amber-800 bg-amber-50 border border-amber-100'}`}>
              Cuota referencial: ~${(planPrice / installments).toFixed(2)} / mes*
            </div>
          )}

          <hr className="my-4 sm:my-6 border-gray-100" />

          {selectedDate && selectedTime && (
            <div className="space-y-3 sm:space-y-4 mb-6">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-semibold">Fecha Seleccionada</p>
                  <p>{selectedDate} {currentDate.toLocaleString("es-ES", { month: "long" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-semibold">Hora</p>
                  <p>{selectedTime}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <span className="text-base sm:text-lg font-bold text-gray-800">Total</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600">${planPrice.toFixed(2)}</span>
          </div>

          {error && <div className="text-red-500 text-xs sm:text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

          {/* Checkbox de Consentimiento Legal Obligatorio */}
          <div className="mb-4 p-3.5 bg-slate-50 border border-gray-200 rounded-xl text-left">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="checkout-terms"
                name="acceptedTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="checkout-terms" className="text-xs text-gray-700 leading-snug cursor-pointer select-none">
                He leído y acepto los{" "}
                <Link href="/legal/terminos" target="_blank" className="text-blue-600 font-semibold underline hover:text-blue-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded">
                  Términos de Servicio
                </Link>
                , las{" "}
                <Link href="/legal/privacidad" target="_blank" className="text-blue-600 font-semibold underline hover:text-blue-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded">
                  Políticas de Privacidad
                </Link>{" "}
                y las{" "}
                <Link href="/legal/reembolsos" target="_blank" className="text-blue-600 font-semibold underline hover:text-blue-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded">
                  Políticas de Cancelación y Reembolso
                </Link>
                .
              </label>
            </div>
          </div>

          {!payphoneReady ? (
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime || !acceptedTerms}
              className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-white text-sm sm:text-base flex justify-center items-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 ${(loading || !selectedDate || !selectedTime || !acceptedTerms) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Preparando cajita de pagos...
                </>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'diferido' 
                      ? `Continuar al Pago Diferido (${installments} cuotas)` 
                      : 'Continuar al Pago con Payphone'}
                  </span>
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 sm:p-4 text-center">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Paso Final</p>
                <p className="text-xs text-gray-700">Haz clic en el botón de Payphone a continuación para pagar sin salir de la página:</p>
              </div>

              {payphoneConfig?.token || process.env.NEXT_PUBLIC_PAYPHONE_TOKEN ? (
                <div className="py-2 flex justify-center w-full overflow-x-auto max-w-full">
                  <div id="pp-button" className="w-full flex justify-center min-h-[50px]"></div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  <strong>Atención:</strong> Falta configurar la variable <code>NEXT_PUBLIC_PAYPHONE_TOKEN</code> en el archivo <code>.env</code>.
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

      <BankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        defaultTab={isNoInterestEligible ? 'no-interest' : 'with-interest'}
      />
    </form>
  );
}
