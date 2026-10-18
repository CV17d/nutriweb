import Link from "next/link";
import Footer from "../../components/Footer";
import WhatsAppFAB from "../../components/WhatsAppFAB";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const legalLinks = [
    { name: "Política de Privacidad", href: "/legal/privacidad" },
    { name: "Términos de Servicio", href: "/legal/terminos" },
    { name: "Política de Cookies", href: "/legal/cookies" },
    { name: "Cancelaciones y Reembolsos", href: "/legal/reembolsos" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Legal */}
      <header className="bg-brand-navy text-brand-white py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <nav aria-label="Miga de pan" className="mb-4">
            <ol className="flex items-center gap-2 text-xs text-gray-400">
              <li>
                <Link href="/" className="hover:text-brand-electric transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric rounded">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-200 font-medium">Marco Legal</li>
            </ol>
          </nav>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Marco Legal y Protección al Paciente
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mt-2 max-w-2xl">
            Transparencia, confidencialidad médica y cumplimiento normativo para tu tranquilidad y bienestar.
          </p>

          {/* Subnavegación de documentos legales */}
          <nav aria-label="Documentos legales" className="mt-8 flex flex-wrap gap-2 sm:gap-3">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 py-10 sm:py-16 px-4 sm:px-6">
        <article className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm border border-gray-100 prose prose-slate max-w-none">
          {children}
        </article>
      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
