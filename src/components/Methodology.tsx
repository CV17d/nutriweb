'use client';

import { useRef, useState, useEffect } from 'react';

export default function Methodology({ data }: { data?: any }) {
  const title = data?.title || 'Metodología en 5 Pasos';
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const card = container.querySelector<HTMLElement>('[data-step-card]');
    const scrollAmount = card ? card.offsetWidth + 16 : container.clientWidth * 0.78;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollToStep = (index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cards = container.querySelectorAll<HTMLElement>('[data-step-card]');
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const card = container.querySelector<HTMLElement>('[data-step-card]');
      if (!card) return;
      const cardWidth = card.offsetWidth + 16;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentStep(Math.max(0, Math.min(newIndex, 4)));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="metodologia" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-24">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy mb-3 sm:mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-brand-navy/70 max-w-2xl">
          Un proceso sistemático y basado en datos diseñado para garantizar resultados consistentes.
        </p>
      </div>

      {/* Contenedor del Carrusel Móvil / Grid en Escritorio */}
      <div className="relative w-full overflow-hidden lg:overflow-visible">
        {/* Botón Flecha Izquierda (Móvil) */}
        <button
          type="button"
          onClick={() => scroll('left')}
          disabled={currentStep === 0}
          aria-label="Paso anterior"
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-gray-200 text-brand-navy flex items-center justify-center transition-all lg:hidden active:scale-95 ${
            currentStep === 0 ? 'opacity-25 cursor-not-allowed pointer-events-none' : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <svg className="w-4 h-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carrusel Deslizable */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 pb-4 px-6 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:gap-6 lg:items-stretch lg:overflow-visible lg:snap-none lg:pb-0"
        >
          {/* Tarjeta 01 */}
          <div
            data-step-card
            className="min-w-[75%] max-w-[78%] flex-none snap-center lg:min-w-0 lg:max-w-none lg:w-full lg:snap-none group bg-brand-white rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col items-start border border-gray-100 shadow-sm relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-electric/10 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/>
                <path d="m9 14 2 2 4-4"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2 sm:mb-3">Evaluación</h3>
            <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed">
              Análisis profundo de tu composición corporal, historial clínico, hábitos, entrenamiento y metas.
            </p>
          </div>

          {/* Tarjeta 02 */}
          <div
            data-step-card
            className="min-w-[75%] max-w-[78%] flex-none snap-center lg:min-w-0 lg:max-w-none lg:w-full lg:snap-none group bg-brand-white rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col items-start border border-gray-100 shadow-sm relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-electric/10 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2 sm:mb-3">Diagnóstico</h3>
            <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed">
              Identificación de oportunidades de mejora y establecimiento de prioridades nutricionales claras.
            </p>
          </div>

          {/* Tarjeta 03 (Destacada) */}
          <div
            data-step-card
            className="min-w-[75%] max-w-[78%] flex-none snap-center lg:min-w-0 lg:max-w-none lg:w-full lg:snap-none group bg-brand-navy rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col items-start shadow-xl relative hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 lg:-mt-4 lg:mb-4 lg:scale-105 hover:lg:scale-[1.08]"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-white/10 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-brand-white/20 transition-all duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/>
                <path d="M2 6h4"/>
                <path d="M2 10h4"/>
                <path d="M2 14h4"/>
                <path d="M2 18h4"/>
                <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-white mb-2 sm:mb-3">Plan<br />Personalizado</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Diseño de una estrategia nutricional única y 100% adaptada a tu estilo de vida y deporte.
            </p>
          </div>

          {/* Tarjeta 04 */}
          <div
            data-step-card
            className="min-w-[75%] max-w-[78%] flex-none snap-center lg:min-w-0 lg:max-w-none lg:w-full lg:snap-none group bg-brand-white rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col items-start border border-gray-100 shadow-sm relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-electric/10 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2 sm:mb-3">Seguimiento</h3>
            <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed">
              Ajustes periódicos basados en tus avances, métricas y sensaciones para asegurar tu progreso.
            </p>
          </div>

          {/* Tarjeta 05 */}
          <div
            data-step-card
            className="min-w-[75%] max-w-[78%] flex-none snap-center lg:min-w-0 lg:max-w-none lg:w-full lg:snap-none group bg-brand-white rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col items-start border border-gray-100 shadow-sm relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-electric/10 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2 sm:mb-3">Educación</h3>
            <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed">
              Te enseño a manejar tus hábitos y alimentarte como un deportista profesional para que desarrolles total autonomía.
            </p>
          </div>
        </div>

        {/* Botón Flecha Derecha (Móvil) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={currentStep === 4}
          aria-label="Paso siguiente"
          className={`absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-gray-200 text-brand-navy flex items-center justify-center transition-all lg:hidden active:scale-95 ${
            currentStep === 4 ? 'opacity-25 cursor-not-allowed pointer-events-none' : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <svg className="w-4 h-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicadores (Dots de Página) en Móvil */}
      <div className="flex justify-center items-center gap-1.5 mt-4 lg:hidden">
        {[0, 1, 2, 3, 4].map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToStep(index)}
            aria-label={`Ir al paso ${index + 1}`}
            className={`transition-all duration-300 rounded-full h-1.5 ${
              currentStep === index
                ? 'w-6 bg-brand-electric'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
