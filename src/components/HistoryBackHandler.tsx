'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Gestor global de historial para garantizar que el retroceso (botón Atrás del navegador/móvil)
 * solo y exclusivamente lleve a la página principal ('/').
 * 
 * Evita que el navegador recorra el historial de subpáginas previamente visitadas
 * (ej: agendar cita -> inicio -> comprar planes -> atrás -> no vuelve a agendar cita).
 */
export default function HistoryBackHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const handlePopState = () => {
      // Si el navegador intenta navegar hacia atrás a cualquier subpágina previa
      // (ej: /citas/gratis, /checkout/..., etc.), interceptamos y reemplazamos
      // inmediatamente hacia la página principal '/'
      if (window.location.pathname !== '/') {
        window.location.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    // Al estar en la página principal, fijamos el estado raíz para no acumular entradas
    if (pathname === '/') {
      try {
        window.history.replaceState({ page: 'home' }, '', '/');
      } catch (e) {
        // En caso de restricciones del navegador
      }
    }
  }, [pathname]);

  return null;
}
