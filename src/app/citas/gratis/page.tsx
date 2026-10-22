import type { Metadata } from "next";
import Link from "next/link";
import FreeAppointmentForm from "../../../components/FreeAppointmentForm";

export const metadata: Metadata = {
  title: 'Valoración Gratuita',
  description: 'Agenda tu primera sesión o valoración inicial sin costo con el nutricionista Andrés Burbano.',
};

export default function FreeAppointmentPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          href="/"
          replace
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy/70 hover:text-brand-electric transition-colors bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver al inicio</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A192F] mb-3 sm:mb-4">
          Agenda tu Consulta Gratuita
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Da el primer paso hacia tu bienestar. Selecciona un horario y hablemos sobre tus objetivos nutricionales sin ningún compromiso.
        </p>
      </div>

      <FreeAppointmentForm />
    </div>
  );
}
