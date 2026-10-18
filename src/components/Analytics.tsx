'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getStoredCookieConsent } from './CookieBanner';

interface AnalyticsProps {
  gaId?: string;
}

export default function Analytics({ gaId = process.env.NEXT_PUBLIC_GA_ID }: AnalyticsProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Verificar el estado guardado al montar el componente
    const current = getStoredCookieConsent();
    if (current?.analytics) {
      setHasConsent(true);
    }

    // Escuchar cambios de consentimiento en tiempo real desde el CookieBanner
    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ analytics: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.analytics === 'boolean') {
        setHasConsent(customEvent.detail.analytics);
      }
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () => window.removeEventListener('cookieConsentChanged', handleConsentChange);
  }, []);

  // Si el usuario no ha otorgado consentimiento explícito, no inyectamos ningún script de analítica
  if (!hasConsent || !gaId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `,
        }}
      />
    </>
  );
}
