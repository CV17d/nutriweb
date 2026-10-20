import Link from 'next/link';

export default async function VerifySuccessPage(props: {
  searchParams: Promise<{ status?: string; error?: string; gcalUrl?: string; type?: string }>;
}) {
  const searchParams = await props.searchParams;
  const isSuccess = searchParams.status === 'success';
  const errorType = searchParams.error;
  const isPresencial = searchParams.type === 'Presencial';
  const meetLink = process.env.MEET_LINK || '';
  const clinicLink = process.env.CLINIC_LOCATION_LINK || 'https://maps.app.goo.gl/1r8denLgxkjWyQiC8';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 sm:p-10 text-center relative overflow-hidden">

        {isSuccess ? (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-50 text-green-500 mb-5 sm:mb-6 shadow-inner">
              <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight">¡Cita Confirmada!</h1>

            {!isPresencial ? (
              <>
                <div className="bg-blue-50 border-l-4 border-[#0052FF] p-3.5 sm:p-4 mb-4 sm:mb-6 text-left rounded-r-lg">
                  <p className="text-blue-900 font-medium text-sm sm:text-base">
                    🗓️ Modalidad Virtual:
                  </p>
                  <p className="text-blue-800 text-xs sm:text-sm mt-1 leading-relaxed">
                    Para tener a mano el enlace de Google Meet y recibir recordatorios automáticos, <strong>agrega el evento a tu calendario</strong>.
                  </p>
                </div>

                {meetLink && (
                  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-6 text-left">
                    <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Enlace de la Videollamada (Google Meet):</p>
                    <a href={meetLink} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold text-[#0052FF] hover:underline break-all">
                      {meetLink}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-blue-50 border-l-4 border-[#0052FF] p-3.5 sm:p-4 mb-4 sm:mb-6 text-left rounded-r-lg">
                  <p className="text-blue-900 font-medium text-sm sm:text-base">
                    🏢 Modalidad Presencial:
                  </p>
                  <p className="text-blue-800 text-xs sm:text-sm mt-1 leading-relaxed">
                    Para tener a mano la fecha, hora y ubicación en tu celular, <strong>agrega el evento a tu calendario</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-200 rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-6 text-left">
                  <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ubicación del Consultorio:</p>
                  <a href={clinicLink} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold text-[#0052FF] hover:underline break-all">
                    Centro de Alto Rendimiento AB, Quito (Ver en Google Maps)
                  </a>
                </div>
              </>
            )}

            {searchParams.gcalUrl && (
              <a
                href={searchParams.gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 sm:px-8 py-3 sm:py-3.5 bg-[#0052FF] text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md w-full mb-3 sm:mb-4 text-sm sm:text-base"
              >
                🗓️ Agregar a Google Calendar
              </a>
            )}
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-rose-500"></div>
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-50 text-red-500 mb-5 sm:mb-6 shadow-inner">
              <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight">Error de Verificación</h1>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed">
              {errorType === 'missing_token'
                ? 'El enlace de verificación parece estar incompleto o roto.'
                : 'El enlace es inválido, ya expiró o la cita ya fue verificada.'}
            </p>
          </>
        )}

        <Link
          href="/"
          replace
          className="inline-block px-6 sm:px-8 py-3 sm:py-3.5 bg-[#0052FF] text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md w-full text-sm sm:text-base"
        >
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
