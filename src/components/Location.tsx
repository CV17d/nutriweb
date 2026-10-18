import ClinicCarousel, { ClinicPhoto } from './ClinicCarousel';

interface LocationProps {
  photos?: ClinicPhoto[];
}

export default function Location({ photos = [] }: LocationProps) {
  return (
    <section id="ubicacion" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-20 scroll-mt-20">
      {/* Encabezado de la Sección */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-light border border-brand-electric/20 text-brand-electric text-xs font-bold tracking-wider uppercase mb-4 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-brand-electric animate-pulse"></span>
          Atención Presencial & Instalaciones
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy tracking-tight mb-3 sm:mb-4">
          Consultorio y Ubicación
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-brand-navy/70 leading-relaxed">
          Conoce el espacio donde realizamos tus evaluaciones antropométricas, análisis de composición corporal y diseño de estrategias nutricionales.
        </p>
      </div>

      {/* Grid Principal: 2 columnas iguales y equilibradas con items-stretch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
        
        {/* Columna Izquierda: Carrusel de Fotos del Consultorio */}
        <div className="flex flex-col h-full gap-3">
          <div className="px-1">
            <h3 className="text-lg md:text-xl font-bold text-brand-navy">
              Instalaciones del Consultorio
            </h3>
          </div>

          {/* Carrusel Interactivo de Fotos */}
          <div className="flex-1 flex flex-col">
            <ClinicCarousel photos={photos} />
          </div>
        </div>

        {/* Columna Derecha: Mapa y Dirección en una sola card del mismo tamaño que el carrusel */}
        <div className="flex flex-col h-full gap-3">
          <div className="px-1">
            <h3 className="text-lg md:text-xl font-bold text-brand-navy">
              Ubicación y Cómo Llegar
            </h3>
          </div>

          {/* Card Unificada del mismo tamaño que el carrusel */}
          <div className="w-full h-full flex-1 flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
            {/* Mapa Interactivo (ocupa la parte superior) */}
            <div className="w-full flex-1 min-h-[240px] md:min-h-[280px] bg-brand-light relative overflow-hidden">
              <iframe 
                src="https://maps.google.com/maps?q=Av.+de+la+Prensa+y+Pedro+de+Valverde,+Quito,+Ecuador&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del consultorio en Google Maps"
                className="w-full h-full absolute inset-0"
              ></iframe>
            </div>

            {/* Dirección, Horarios y Métodos de Pago (parte inferior de la misma card) */}
            <div className="w-full bg-slate-50/90 border-t border-gray-100 p-4 sm:p-5 md:p-6 flex flex-col gap-4 shrink-0">
              {/* Dirección */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-light flex items-center justify-center shrink-0 text-brand-electric">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col flex-1">
                  <h4 className="text-sm font-bold text-brand-navy mb-0.5">Dirección del consultorio</h4>
                  <p className="text-xs text-brand-navy/70 leading-relaxed mb-1.5">
                    Av. de la Prensa y Pedro de Valverde<br />
                    Quito – Ecuador
                  </p>
                  <a 
                    href="https://maps.app.goo.gl/jhvHicvbBZzniahcA?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-electric hover:underline"
                  >
                    Abrir ruta en Google Maps
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="w-full h-px bg-gray-200/70"></div>

              {/* Horarios y Pagos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center shrink-0 text-brand-electric">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-brand-navy">Horarios</span>
                    <p className="text-[11px] text-brand-navy/70 leading-tight">
                      Lun - Vie: 08:00 - 17:00<br />
                      Sáb: 09:00 - 15:00
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-brand-navy/60 uppercase tracking-wider mb-1.5">
                    Pagos Aceptados
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-brand-light text-brand-navy text-[11px] font-medium">Tarjetas</span>
                    <span className="px-2 py-0.5 rounded-md bg-brand-light text-brand-navy text-[11px] font-medium">Transferencia</span>
                    <span className="px-2 py-0.5 rounded-md bg-brand-light text-brand-navy text-[11px] font-medium">Efectivo</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
