'use client';

import { useRef, useState, useEffect } from 'react';

export default function Testimonials({ cases = [] }: { cases?: any[] }) {
  const testimonials = cases.length > 0 ? cases.map(c => ({
    quote: `"${c.comment}"`,
    name: c.patient_name,
    role: c.metrics || "PACIENTE",
    initials: c.patient_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
    image_url: c.image_url,
    rating: c.rating ?? 5
  })) : [
    {
      quote:
        '"Bajar mis tiempos de maratón parecía imposible después de estancarme por 2 años. El plan de Andrés no solo me ayudó a perder grasa sin perder músculo, sino que la estrategia de carga de carbohidratos cambió por completo mis últimos 10k en carrera."',
      name: "Carolina V.",
      role: "MARATONISTA AMATEUR",
      initials: "CV",
      rating: 5,
    },
    {
      quote:
        '"La precisión es brutal. Entender cómo sincronizar mis comidas con los WODs me permitió recuperar mucho más rápido y aumentar mis RM. El plan Elite vale cada centavo si realmente te tomas en serio tu deporte."',
      name: "Mateo R.",
      role: "ATLETA CROSSFIT",
      initials: "MR",
      rating: 5,
    },
    {
      quote:
        '"Como chef, aprecio que las recomendaciones de Andrés son reales y comestibles, no solo pollo hervido. Logramos el peso para la competencia sin perder potencia en la bicicleta. Totalmente recomendado."',
      name: "Daniel S.",
      role: "TRIATLETA IRONMAN",
      initials: "DS",
      rating: 5,
    },
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const card = container.querySelector<HTMLElement>('[data-testimonial-card]');
    const scrollAmount = card ? card.offsetWidth + 16 : container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollToTestimonial = (index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cards = container.querySelectorAll<HTMLElement>('[data-testimonial-card]');
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
      const card = container.querySelector<HTMLElement>('[data-testimonial-card]');
      if (!card) return;
      const cardWidth = card.offsetWidth + 16;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.max(0, Math.min(newIndex, testimonials.length - 1)));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [testimonials.length]);

  return (
    <section id="testimonios" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-24">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-16 md:mb-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy mb-3 sm:mb-4 tracking-tight">
          Casos de Éxito
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-brand-navy/70 max-w-2xl">
          Atletas que han transformado su rendimiento a través de la nutrición científica.
        </p>
      </div>

      {/* Contenedor del Carrusel Móvil / Grid en Escritorio */}
      <div className="relative w-full overflow-hidden md:overflow-visible px-2 sm:px-4 md:px-0">
        {/* Botón Flecha Izquierda (Móvil) */}
        <button
          type="button"
          onClick={() => scroll('left')}
          disabled={currentIndex === 0}
          aria-label="Testimonio anterior"
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-gray-200 text-brand-navy flex items-center justify-center transition-all md:hidden active:scale-95 ${
            currentIndex === 0 ? 'opacity-25 cursor-not-allowed pointer-events-none' : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <svg className="w-4 h-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carrusel Deslizable */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 pt-12 pb-4 px-6 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-8 md:pt-10 md:overflow-visible md:snap-none md:pb-0"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              data-testimonial-card
              className="min-w-[85%] max-w-[90%] flex-none snap-center md:min-w-0 md:max-w-none md:w-full md:snap-none bg-brand-white rounded-3xl p-6 sm:p-8 pt-12 relative shadow-lg border border-gray-100 flex flex-col justify-between"
            >
              {/* Avatar Flotante */}
              <div className="absolute -top-10 left-8 md:left-10 w-20 h-20 rounded-full border-4 border-brand-light bg-gray-300 flex items-center justify-center shadow-md overflow-hidden">
                {(testimonial as any).image_url ? (
                  <img src={(testimonial as any).image_url} alt={`Fotografía del paciente ${testimonial.name}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gray-500">{testimonial.initials}</span>
                )}
              </div>

              <div>
                {/* Estrellas */}
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-5 h-5 ${(testimonial as any).rating >= star ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Cita */}
                <p className="text-sm text-brand-navy/80 italic leading-relaxed mb-8">
                  {testimonial.quote}
                </p>
              </div>

              {/* Autor */}
              <div className="flex flex-col">
                <span className="font-bold text-brand-navy">{testimonial.name}</span>
                <span className="text-[10px] font-bold text-brand-electric uppercase tracking-widest mt-1">
                  {testimonial.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Flecha Derecha (Móvil) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={currentIndex >= testimonials.length - 1}
          aria-label="Testimonio siguiente"
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-gray-200 text-brand-navy flex items-center justify-center transition-all md:hidden active:scale-95 ${
            currentIndex >= testimonials.length - 1 ? 'opacity-25 cursor-not-allowed pointer-events-none' : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <svg className="w-4 h-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicadores (Dots de Página) en Móvil */}
      <div className="flex justify-center items-center gap-1.5 mt-4 md:hidden">
        {testimonials.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToTestimonial(index)}
            aria-label={`Ir al testimonio ${index + 1}`}
            className={`transition-all duration-300 rounded-full h-1.5 ${
              currentIndex === index
                ? 'w-6 bg-brand-electric'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
