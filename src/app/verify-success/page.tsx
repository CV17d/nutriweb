import Link from 'next/link';

export default async function VerifySuccessPage(props: {
  searchParams: Promise<{ status?: string; error?: string; gcalUrl?: string }>;
}) {
  const searchParams = await props.searchParams;
  const isSuccess = searchParams.status === 'success';
  const errorType = searchParams.error;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center relative overflow-hidden">
        
        {isSuccess ? (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 text-green-500 mb-6 shadow-inner">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">¡Cita Confirmada!</h1>
            <div className="bg-blue-50 border-l-4 border-[#0052FF] p-4 mb-8 text-left rounded-r-lg">
              <p className="text-blue-900 font-medium">
                ⚠️ Paso final obligatorio:
              </p>
              <p className="text-blue-800 text-sm mt-1">
                Para obtener el enlace de Google Meet para tu videollamada, <strong>debes agregar el recordatorio a tu calendario</strong> haciendo clic en el botón de abajo.
              </p>
            </div>

            {searchParams.gcalUrl && (
              <a
                href={searchParams.gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3.5 bg-[#0052FF] text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md w-full mb-4"
              >
                🗓️ Agregar a Google Calendar
              </a>
            )}
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-rose-500"></div>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 text-red-500 mb-6 shadow-inner">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Error de Verificación</h1>
            <p className="text-gray-500 text-lg mb-8">
              {errorType === 'missing_token' 
                ? 'El enlace de verificación parece estar incompleto o roto.' 
                : 'El enlace es inválido, ya expiró o la cita ya fue verificada.'}
            </p>
          </>
        )}

        <Link
          href="/"
          replace
          className="inline-block px-8 py-3.5 bg-[#0052FF] text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md w-full"
        >
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
