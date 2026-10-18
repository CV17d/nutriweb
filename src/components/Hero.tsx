import Link from "next/link";

export default function Hero({ data }: { data?: any }) {
  const title = data?.title || '<span class="text-brand-electric">Convierte tu alimentación en una ventaja competitiva</span>';
  const subtitle = data?.subtitle || 'Planes nutricionales precisos y personalizados para atletas y entusiastas del fitness que buscan optimizar su rendimiento, composición corporal y recuperación.';
  const imageUrl = data?.imageUrl || null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
        {/* Columna Izquierda: Contenido */}
        <div className="flex flex-col items-start gap-5 sm:gap-6">
          {/* Badge pequeño superior */}
          <div className="flex items-center gap-2 bg-brand-light border border-gray-200 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-brand-navy">
            <span className="w-2 h-2 rounded-full bg-brand-electric"></span>
            NUTRICIÓN DEPORTIVA BASADA EN EVIDENCIA
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy leading-tight tracking-tight" dangerouslySetInnerHTML={{ __html: title }}>
          </h1>

          {/* Párrafo Descriptivo */}
          <p className="text-sm sm:text-base md:text-lg text-brand-navy/70 max-w-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: subtitle }}>
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mt-2">
            <Link
              href="/citas/gratis"
              className="bg-brand-electric text-brand-white px-6 sm:px-8 py-3.5 rounded-full font-bold text-xs tracking-wide shadow-md hover:opacity-90 transition-opacity text-center flex items-center justify-center uppercase"
            >
              Agendar consulta gratuita
            </Link>
            <Link
              href="/#planes"
              className="bg-transparent border border-gray-300 text-brand-navy px-6 sm:px-8 py-3.5 rounded-full font-bold text-xs tracking-wide hover:bg-gray-50 transition-colors text-center flex items-center justify-center"
            >
              VER PLANES DE 3 MESES
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Imagen Placeholder y Badges */}
        <div className="relative w-full aspect-square md:aspect-[4/5] lg:aspect-square bg-gray-200 rounded-[2rem] overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner">
          {imageUrl ? (
            <img src={imageUrl} alt="Andrés Burbano - Nutricionista Deportivo y Clínico en consulta" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 font-medium">Placeholder Imagen (Andrés)</span>
          )}

          {/* Badge Flotante Superior Derecho */}
          <div className="absolute top-4 sm:top-8 right-2 sm:right-4 md:right-8 bg-brand-white shadow-xl rounded-full p-2 pr-4 sm:pr-6 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-navy flex items-center justify-center shrink-0">
              {/* Icono de matraz/ciencia simulado */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-gray-500 tracking-wider">Precisión</span>
              <span className="text-xs sm:text-sm font-extrabold text-brand-navy leading-none">Científica</span>
            </div>
          </div>

          {/* Badge Flotante Inferior Izquierdo */}
          <div className="absolute bottom-4 sm:bottom-12 left-2 sm:left-4 md:left-4 bg-brand-white/90 backdrop-blur-md shadow-xl rounded-full p-2 pr-4 sm:pr-6 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-electric flex items-center justify-center shrink-0">
              {/* Icono de gráfico simulado */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-gray-500 tracking-wider">Rendimiento</span>
              <span className="text-base sm:text-lg font-extrabold text-brand-navy leading-none">+35%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
