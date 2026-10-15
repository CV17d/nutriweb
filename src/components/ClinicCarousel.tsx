'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ClinicPhoto {
  id: number;
  image_url: string;
  caption?: string | null;
  display_order?: number;
}

interface ClinicCarouselProps {
  photos?: ClinicPhoto[];
}

export default function ClinicCarousel({ photos = [] }: ClinicCarouselProps) {
  // Fotos de respaldo si la base de datos aún no tiene registros
  const fallbackPhotos: ClinicPhoto[] = [
    {
      id: -1,
      image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
      caption: 'Área de consulta privada y planificación nutricional personalizada',
      display_order: 1
    },
    {
      id: -2,
      image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      caption: 'Consultorio equipado para valoración antropométrica y bioimpedancia',
      display_order: 2
    },
    {
      id: -3,
      image_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
      caption: 'Ambiente confortable y moderno diseñado para tu bienestar',
      display_order: 3
    },
    {
      id: -4,
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      caption: 'Equipos de alta precisión para el seguimiento de tu composición corporal',
      display_order: 4
    }
  ];

  const items = photos && photos.length > 0 ? photos : fallbackPhotos;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Navegación
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay con pausa en interacción
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused, items.length, goToNext]);

  // Manejo de gestos táctiles (Swipe en móviles)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if (distance > 0) {
        goToNext(); // Deslizar hacia la izquierda -> siguiente
      } else {
        goToPrevious(); // Deslizar hacia la derecha -> anterior
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentPhoto = items[currentIndex] || items[0];

  return (
    <div 
      className="w-full h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Carrusel de fotos del consultorio"
    >
      {/* Contenedor Principal de la Imagen (Formato casi vertical aspect-[4/5]) */}
      <div 
        className="relative w-full aspect-[4/5] max-h-[500px] md:max-h-[540px] flex-1 bg-slate-900 overflow-hidden select-none group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Imágenes con transición fluida */}
        {items.map((photo, index) => (
          <div
            key={photo.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={photo.image_url}
              alt={photo.caption || `Instalaciones del consultorio - Foto ${index + 1}`}
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Degradado sutil para resaltar controles y contraste */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
          </div>
        ))}

        {/* Badge superior: Contador de fotos (sin icono) */}
        <div className="absolute top-3.5 left-3.5 z-20 px-2.5 py-1 rounded-full bg-brand-navy/70 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-md">
          <span>{currentIndex + 1} / {items.length}</span>
        </div>

        {/* Botones de Navegación Anterior / Siguiente (Flechas) */}
        {items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2.5 md:left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-navy/60 hover:bg-brand-navy/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-90"
              aria-label="Foto anterior"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2.5 md:right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-navy/60 hover:bg-brand-navy/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-90"
              aria-label="Foto siguiente"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ÁREA DE TEXTO / CAPTION BAJO CADA FOTO */}
      <div className="w-full bg-slate-50/90 border-t border-gray-100 px-4 py-3 md:px-5 md:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Texto descriptivo configurado en el admin (sin icono de edificio) */}
        <div className="flex flex-col flex-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-brand-electric mb-0.5">
            Espacio del Consultorio
          </span>
          <p className="text-xs md:text-sm font-semibold text-brand-navy leading-snug transition-all duration-300">
            {currentPhoto.caption && currentPhoto.caption.trim().length > 0 
              ? currentPhoto.caption 
              : 'Instalaciones equipadas para tu evaluación y bienestar nutricional'}
          </p>
        </div>

        {/* Indicadores de Puntos (Dots) Interactivos */}
        {items.length > 1 && (
          <div className="flex items-center gap-1.5 shrink-0 self-center sm:self-auto">
            {items.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => goToSlide(dotIndex)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dotIndex === currentIndex 
                    ? 'w-6 bg-brand-electric shadow-xs' 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a la foto ${dotIndex + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
