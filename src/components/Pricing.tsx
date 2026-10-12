"use client";

import Link from 'next/link';
import { useState } from 'react';

function PricingCard({ plan }: { plan: any }) {
  const [expanded, setExpanded] = useState(false);
  const features = plan.features || [];
  
  // Si es un plan destacado (Performance)
  const isRecommended = plan.is_recommended;
  const isElite = plan.name === 'Elite';
  
  return (
    <div className={`rounded-3xl p-8 flex flex-col transition-all duration-300 relative 
      ${isRecommended 
        ? 'bg-brand-navy shadow-2xl lg:scale-105 z-10 border border-brand-navy/50 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:lg:scale-[1.08]' 
        : 'bg-brand-white border border-gray-100 shadow-sm hover:-translate-y-2 hover:shadow-xl'
      }`}>
      
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-electric text-brand-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md whitespace-nowrap">
          Más Popular
        </div>
      )}

      <div className="flex-grow">
        <h3 className={`text-xl font-bold mb-2 ${isRecommended ? 'text-brand-white' : 'text-brand-navy'}`}>
          {plan.name}
        </h3>
        <div className="flex items-end gap-1 mb-4">
          <span className={`text-5xl font-black ${isRecommended ? 'text-brand-white' : 'text-brand-navy'}`}>
            ${plan.price}
          </span>
          <span className={`text-sm font-semibold mb-2 ${isRecommended ? 'text-gray-400' : 'text-brand-navy/60'}`}>
            / {plan.duration_months} mes{plan.duration_months > 1 ? 'es' : ''}
          </span>
        </div>
        <p className={`text-sm mb-4 min-h-[60px] ${isRecommended ? 'text-gray-300' : 'text-brand-navy/70'}`} dangerouslySetInnerHTML={{ __html: plan.description }} />
        
        <ul className="flex flex-col mb-2">
          {features.map((item: string, i: number) => (
            <li 
              key={i} 
              className={`flex items-start gap-2 overflow-hidden transition-all duration-300 ease-in-out
                ${!expanded && i >= 4 ? 'max-h-0 opacity-0 m-0' : 'max-h-20 opacity-100 mb-3'}
              `}
            >
              <svg className="w-4 h-4 text-brand-electric shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className={`text-xs font-medium leading-snug ${isRecommended ? 'text-brand-white/90' : 'text-brand-navy/80'}`}>
                {item}
              </span>
            </li>
          ))}
        </ul>
        
        {features.length > 4 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`text-xs font-bold transition-colors mb-6 flex items-center gap-1
              ${isRecommended ? 'text-brand-electric hover:text-white' : (isElite ? 'text-brand-electric hover:text-brand-navy' : 'text-brand-electric hover:text-brand-navy')}
            `}
          >
            {expanded ? 'Ver menos' : `Ver ${features.length - 4} más...`}
            <svg className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>
        )}
      </div>
      
      <Link 
        href={`/checkout/${plan.id}`} 
        className={`w-full inline-block text-center rounded-full py-3.5 font-bold text-xs uppercase tracking-wider transition-colors mt-auto
          ${isRecommended 
            ? 'bg-brand-electric text-brand-white shadow-lg hover:opacity-90' 
            : (isElite 
                ? 'border-2 border-brand-navy text-brand-navy hover:bg-brand-navy/5' 
                : 'border-2 border-brand-electric text-brand-electric hover:bg-brand-electric/5'
              )
          }
        `}
      >
        Comprar Plan
      </Link>
    </div>
  );
}

export default function Pricing({ plans = [] }: { plans?: any[] }) {
  // En caso de que no haya planes cargados de BD, renderizamos algo básico o vacío
  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <section id="planes" className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy mb-4 tracking-tight">
          Planes Nutricionales
        </h2>
        <p className="text-base md:text-lg text-brand-navy/70 max-w-2xl">
          Inversiones en tu salud y rendimiento. Elige la opción que mejor se adapte a tus metas y nivel de compromiso.
        </p>
      </div>

      {/* Grid de Precios */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(plans.length, 4)} gap-8 lg:gap-6 items-start`}>
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
