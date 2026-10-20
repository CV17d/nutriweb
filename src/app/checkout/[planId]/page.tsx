import Link from 'next/link';
import CheckoutForm from '../../../components/CheckoutForm';
import { query } from '../../../lib/db';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "Finalizar Compra | Andrés Nutrición",
  description: "Completa los pasos para asegurar tu plan nutricional.",
};

export default async function CheckoutPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId: planIdStr } = await params;
  const planId = parseInt(planIdStr);
  
  if (isNaN(planId)) {
    notFound();
  }

  // Obtener detalles del plan desde la base de datos
  const planQuery = await query('SELECT * FROM plans WHERE id = $1 AND is_active = true', [planId]);
  
  if (planQuery.rows.length === 0) {
    notFound();
  }

  const plan = planQuery.rows[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto mb-6">
        <Link 
          href="/" 
          replace
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy/70 hover:text-brand-electric transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver al inicio</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0A192F] mb-2">
          Finalizar Compra
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Completa los pasos para asegurar tu plan nutricional.
        </p>
      </div>

      <CheckoutForm 
        planId={plan.id}
        planName={plan.name}
        planPrice={parseFloat(plan.price)}
        totalSessions={plan.total_sessions}
        durationMonths={plan.duration_months}
      />
    </div>
  );
}
