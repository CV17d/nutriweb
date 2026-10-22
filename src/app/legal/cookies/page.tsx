import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: "Información detallada sobre el uso de cookies técnicas, analíticas y de terceros en nuestra web.",
};

export default function CookiesPage() {
  return (
    <div className="space-y-8 text-gray-800 leading-relaxed">
      <div>
        <span className="text-xs font-bold text-brand-electric uppercase tracking-wider">Transparencia Digital</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1 mb-2">
          Política de Cookies y Privacidad de Navegación
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">Última actualización: 17 de Octubre de 2026</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">1. ¿Qué son las Cookies?</h3>
        <p className="text-sm sm:text-base">
          Una cookie es un pequeño archivo de texto que los sitios web almacenan en tu dispositivo (ordenador, tablet o teléfono móvil) mientras navegas. Permiten recordar tus preferencias de navegación, garantizar la seguridad en el inicio de sesión y analizar de forma agregada el uso de nuestro portal.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">2. Tipos de Cookies que Utilizamos</h3>
        <p className="text-sm sm:text-base">Nuestro sitio web clasifica las cookies en las siguientes categorías:</p>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-2xl p-4 bg-slate-50">
            <h4 className="font-bold text-brand-navy text-sm sm:text-base">A. Cookies Técnicas y Estrictamente Necesarias (Siempre Activas)</h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Son indispensables para el funcionamiento seguro del sitio web y no pueden ser desactivadas. Incluyen el registro de tu preferencia de consentimiento (andres_nutricion_cookie_consent).
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-4 bg-slate-50">
            <h4 className="font-bold text-brand-navy text-sm sm:text-base">B. Cookies de Rendimiento y Analítica (Opcionales - Sujetas a Consentimiento)</h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Nos permiten medir de manera anónima y agregada el volumen de visitas, páginas más consultadas y velocidad de carga, ayudándonos a mejorar la experiencia de usuario. <strong>Estos scripts no se ejecutan hasta que tú los autorices expresamente en nuestro Banner de Cookies.</strong>
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-4 bg-slate-50">
            <h4 className="font-bold text-brand-navy text-sm sm:text-base">C. Cookies y Scripts de Servicios Externos</h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Durante el proceso de pago o agendamiento, se pueden invocar scripts externos de <strong>Payphone</strong> (validación antifraude bancaria) o <strong>Google reCAPTCHA</strong> (protección contra spam automatizado).
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">3. Gestión y Revocación del Consentimiento</h3>
        <p className="text-sm sm:text-base">
          En cualquier momento puedes cambiar o revocar tu consentimiento sobre las cookies no esenciales haciendo clic en el enlace de "Configuración de Cookies" ubicado en el pie de página de nuestro portal o borrando los datos de almacenamiento local de tu navegador.
        </p>
        <p className="text-sm sm:text-base">
          Asimismo, todos los navegadores modernos permiten deshabilitar o eliminar cookies desde sus paneles de configuración:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-xs sm:text-sm text-gray-600">
          <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
          <li><strong>Mozilla Firefox:</strong> Opciones &gt; Privacidad y Seguridad &gt; Cookies y datos del sitio.</li>
          <li><strong>Apple Safari:</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies.</li>
          <li><strong>Microsoft Edge:</strong> Configuración &gt; Permisos del sitio &gt; Cookies y datos del sitio.</li>
        </ul>
      </section>
    </div>
  );
}
