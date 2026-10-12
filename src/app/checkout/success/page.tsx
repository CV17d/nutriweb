import Link from 'next/link';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; appointmentType?: string; [key: string]: string | string[] | undefined }>;
}) {
  const { date, appointmentType } = await searchParams;
  let calendarUrl = "#";

  if (date && typeof date === 'string') {
    const dateObj = new Date(date);
    const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000); // +1 hour

    const formatGCalDate = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const startStr = formatGCalDate(dateObj);
    const endStr = formatGCalDate(endDateObj);
    
    const title = encodeURIComponent("Cita Nutricional - Andrés Burbano");
    const details = encodeURIComponent(`Cita nutricional (${appointmentType || "Virtual"}).`);
    const location = encodeURIComponent(appointmentType === "Presencial" ? "Centro de Alto Rendimiento AB, Quito" : "Enlace Virtual (te enviaremos el link)");

    calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  }

  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white max-w-lg w-full rounded-[2rem] shadow-xl border border-gray-100 p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-electric to-blue-400"></div>

        <div className="w-24 h-24 bg-blue-50 text-brand-electric rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-extrabold text-brand-navy mb-4 tracking-tight">¡Pago Exitoso!</h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          Tu plan ha sido activado y tu primera consulta ha sido agendada. Hemos enviado los detalles a tu correo y bloqueado el espacio en nuestro calendario.
        </p>

        <div className="flex flex-col gap-4">
          {date && typeof date === 'string' && (
            <a 
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-brand-electric hover:opacity-90 text-white font-bold py-4 px-8 rounded-full transition-opacity flex items-center justify-center gap-3 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Añadir a Google Calendar
            </a>
          )}
          <Link href="/" replace className="w-full bg-transparent border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-brand-navy font-bold py-4 px-8 rounded-full transition-colors flex items-center justify-center">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
