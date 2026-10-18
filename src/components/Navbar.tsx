'use client';

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-white">
      <nav className="w-full py-3.5 sm:py-4.5 px-4 sm:px-6 md:px-12 flex items-center justify-between border-b border-brand-light/20 shadow-xs backdrop-blur-md bg-brand-white/95">
        {/* Izquierda: Logo y Nombre */}
        <Link 
          href="/" 
          replace 
          prefetch={true} 
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0"
        >
          <Logo 
            className="h-10 sm:h-12 md:h-16 w-auto shrink-0 transition-transform duration-200 group-hover:scale-105" 
            color="#131a26" 
          />
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl md:text-[26px] font-black text-brand-navy tracking-tight leading-tight group-hover:text-brand-electric transition-colors">
              Andrés Burbano
            </span>
            <span className="text-[10px] sm:text-xs md:text-sm font-bold text-brand-electric tracking-widest uppercase">
              Nutricionista
            </span>
          </div>
        </Link>

        {/* Centro: Enlaces de Navegación de Escritorio (PC) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[15px] xl:text-base font-semibold text-brand-navy/80">
          <Link 
            href="/#sobre-mi" 
            replace
            className="flex items-center gap-1.5 xl:gap-2 hover:text-brand-electric transition-colors group/item py-1"
          >
            <svg className="w-[18px] h-[18px] xl:w-5 xl:h-5 text-brand-electric group-hover/item:scale-110 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Sobre Mí</span>
          </Link>

          <Link 
            href="/#metodologia" 
            replace
            className="flex items-center gap-1.5 xl:gap-2 hover:text-brand-electric transition-colors group/item py-1"
          >
            <svg className="w-[18px] h-[18px] xl:w-5 xl:h-5 text-brand-electric group-hover/item:scale-110 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Metodología</span>
          </Link>

          <Link 
            href="/#planes" 
            replace
            className="flex items-center gap-1.5 xl:gap-2 hover:text-brand-electric transition-colors group/item py-1"
          >
            <svg className="w-[18px] h-[18px] xl:w-5 xl:h-5 text-brand-electric group-hover/item:scale-110 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Planes</span>
          </Link>

          <Link 
            href="/#ubicacion" 
            replace
            className="flex items-center gap-1.5 xl:gap-2 hover:text-brand-electric transition-colors group/item py-1"
          >
            <svg className="w-[18px] h-[18px] xl:w-5 xl:h-5 text-brand-electric group-hover/item:scale-110 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Ubicación</span>
          </Link>
        </div>

        {/* Derecha: Botón CTA, WhatsApp y Botón Hamburguesa */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link 
            href="/citas/gratis" 
            className="bg-brand-electric text-brand-white px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm xl:text-base shadow-md hover:opacity-90 hover:shadow-lg transition-all whitespace-nowrap flex items-center gap-1.5 sm:gap-2"
          >
            <svg className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Agendar cita gratuita</span>
          </Link>

          <a
            href="https://wa.me/593997453592?text=Hola%20Andr%C3%A9s%2C%20visit%C3%A9%20tu%20p%C3%A1gina%20web%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20tus%20servicios%20y%20planes%20disponibles."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white p-2.5 rounded-full shadow-md hover:bg-[#20b858] hover:scale-105 transition-all hidden md:flex items-center justify-center"
            aria-label="Contactar por WhatsApp"
            title="WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          </a>

          {/* Botón Menú Hamburguesa en móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 sm:p-2.5 rounded-xl text-brand-navy hover:text-brand-electric hover:bg-gray-100/80 transition-colors lg:hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-electric/30"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Menú Desplegable Móvil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden w-full bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-2xl px-5 py-6 flex flex-col gap-2 animate-fadeIn">
          <Link
            href="/#sobre-mi"
            replace
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 py-3 px-4 rounded-xl text-base font-semibold text-brand-navy hover:text-brand-electric hover:bg-blue-50/60 transition-colors"
          >
            <svg className="w-5 h-5 text-brand-electric shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Sobre Mí</span>
          </Link>

          <Link
            href="/#metodologia"
            replace
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 py-3 px-4 rounded-xl text-base font-semibold text-brand-navy hover:text-brand-electric hover:bg-blue-50/60 transition-colors"
          >
            <svg className="w-5 h-5 text-brand-electric shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Metodología</span>
          </Link>

          <Link
            href="/#planes"
            replace
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 py-3 px-4 rounded-xl text-base font-semibold text-brand-navy hover:text-brand-electric hover:bg-blue-50/60 transition-colors"
          >
            <svg className="w-5 h-5 text-brand-electric shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Planes de Nutrición</span>
          </Link>

          <Link
            href="/#ubicacion"
            replace
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 py-3 px-4 rounded-xl text-base font-semibold text-brand-navy hover:text-brand-electric hover:bg-blue-50/60 transition-colors"
          >
            <svg className="w-5 h-5 text-brand-electric shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Ubicación y Consultorio</span>
          </Link>

          <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2.5">
            <a
              href="https://wa.me/593997453592?text=Hola%20Andr%C3%A9s%2C%20visit%C3%A9%20tu%20p%C3%A1gina%20web%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20tus%20servicios%20y%20planes%20disponibles."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-[#25D366] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-sm hover:bg-[#20b858] transition-all flex items-center justify-center gap-2 text-center"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
