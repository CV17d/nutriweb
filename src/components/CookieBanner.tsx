'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export const COOKIE_CONSENT_KEY = 'andres_nutricion_cookie_consent';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  timestamp: string;
}

export function getStoredCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredCookieConsent(prefs: CookiePreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: prefs }));
  } catch (err) {
    console.error('Error saving cookie consent preference', err);
  }
}

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredCookieConsent();
    if (!stored) {
      setShowBanner(true);
    } else {
      setAnalyticsAllowed(stored.analytics);
    }

    const handleOpenPreferences = () => {
      setShowBanner(true);
      setShowConfig(true);
    };

    window.addEventListener('openCookiePreferences', handleOpenPreferences);
    return () => window.removeEventListener('openCookiePreferences', handleOpenPreferences);
  }, []);

  if (!mounted || !showBanner) return null;

  const handleAcceptAll = () => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };
    setStoredCookieConsent(prefs);
    setShowBanner(false);
    setShowConfig(false);
  };

  const handleAcceptNecessary = () => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    setStoredCookieConsent(prefs);
    setShowBanner(false);
    setShowConfig(false);
  };

  const handleSaveCustom = () => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: analyticsAllowed,
      timestamp: new Date().toISOString(),
    };
    setStoredCookieConsent(prefs);
    setShowBanner(false);
    setShowConfig(false);
  };

  return (
    <aside
      role="region"
      aria-label="Consentimiento de cookies y privacidad"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-brand-navy/95 backdrop-blur-md text-brand-white border-t border-white/10 shadow-2xl animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
        
        {/* Texto explicativo */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Cookie">🍪</span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Tu Privacidad y Uso de Cookies
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-4xl">
            Utilizamos cookies técnicas necesarias para el agendamiento y la seguridad de la sesión. También podemos utilizar cookies analíticas anónimas para evaluar el rendimiento de la web, siempre que nos des tu consentimiento previo. Puedes consultar nuestra{' '}
            <Link
              href="/legal/cookies"
              className="text-brand-electric font-semibold underline hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric rounded"
            >
              Política de Cookies
            </Link>{' '}
            o personalizar tus opciones.
          </p>

          {/* Panel de Configuración Expandido */}
          {showConfig && (
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Cookies Técnicas Necesarias</h4>
                  <p className="text-xs text-gray-400">Requeridas para agendar citas, pagos y seguridad.</p>
                </div>
                <span className="text-xs bg-brand-electric/20 text-brand-electric font-bold px-3 py-1 rounded-full">
                  Siempre Activas
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white">Cookies de Analítica y Rendimiento</h4>
                  <p className="text-xs text-gray-400">Nos permiten entender de forma anónima cómo interactúas con la web.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyticsAllowed}
                    onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                    className="sr-only peer"
                    aria-label="Permitir cookies analíticas"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-electric"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
          {!showConfig ? (
            <>
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-full border border-gray-400 hover:border-white text-gray-200 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric"
              >
                Configurar
              </button>
              <button
                type="button"
                onClick={handleAcceptNecessary}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric"
              >
                Solo Necesarias
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-full bg-brand-electric hover:bg-blue-600 text-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Aceptar Todas
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-full border border-gray-400 hover:border-white text-gray-200 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-full bg-brand-electric hover:bg-blue-600 text-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Guardar Preferencias
              </button>
            </>
          )}
        </div>

      </div>
    </aside>
  );
}
