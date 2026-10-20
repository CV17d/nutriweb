"use client";

import Link from 'next/link';
import { useState } from 'react';
import BankModal from './BankModal';

function PricingCard({ plan, onOpenBanks }: { plan: any; onOpenBanks: (tab: 'no-interest' | 'with-interest') => void }) {
  const [expanded, setExpanded] = useState(false);
  const features = plan.features || [];
  
  // Si es un plan destacado
  const isRecommended = plan.is_recommended;
  const isElite = plan.name === 'Elite';
  const priceNum = parseFloat(plan.price) || 0;
  const isNoInterest = priceNum >= 200;
  
  return (
    <div className={`w-full rounded-3xl p-5 xl:p-7 flex flex-col transition-all duration-300 relative h-full
      ${isRecommended 
        ? 'bg-brand-navy shadow-2xl border-2 border-brand-electric ring-4 ring-brand-electric/20 lg:scale-[1.03] z-10 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' 
        : 'bg-brand-white border border-gray-100 shadow-sm hover:-translate-y-2 hover:shadow-xl'
      }`}>
      
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-electric text-brand-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md whitespace-nowrap">
          Más Popular
        </div>
      )}

      <div className="flex-grow flex flex-col">
        <h3 className={`text-xl font-bold mb-2 ${isRecommended ? 'text-brand-white' : 'text-brand-navy'}`}>
          {plan.name}
        </h3>
        <div className="flex items-end gap-1 mb-2 flex-wrap">
          <span className={`text-3xl xl:text-4xl font-black ${isRecommended ? 'text-brand-white' : 'text-brand-navy'}`}>
            ${plan.price}
          </span>
          <span className={`text-xs xl:text-sm font-semibold mb-1.5 ${isRecommended ? 'text-gray-400' : 'text-brand-navy/60'}`}>
            / {plan.duration_months} mes{plan.duration_months > 1 ? 'es' : ''}
          </span>
        </div>

        {/* Badge de diferido condicional */}
        <div className="mb-4">
          {isNoInterest ? (
            <button
              type="button"
              onClick={() => onOpenBanks('no-interest')}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors text-left ${
                isRecommended 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Haz clic para ver los bancos participantes sin intereses"
            >
              <span>⚡</span>
              <span>Hasta 3 y 6 meses <strong>sin intereses</strong></span>
              <svg className="w-3 h-3 opacity-70 ml-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenBanks('with-interest')}
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors text-left ${
                isRecommended 
                  ? 'bg-white/10 text-gray-300 border border-white/15 hover:bg-white/15' 
                  : 'bg-slate-50 text-gray-600 border border-gray-200 hover:bg-slate-100'
              }`}
              title="Haz clic para ver los bancos participantes con intereses"
            >
              <span>💳</span>
              <span>Diferido disponible (con intereses)</span>
              <svg className="w-3 h-3 opacity-70 ml-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
        <p className={`text-xs xl:text-sm mb-4 min-h-[50px] leading-relaxed ${isRecommended ? 'text-gray-300' : 'text-brand-navy/70'}`} dangerouslySetInnerHTML={{ __html: plan.description }} />
        
        <ul className="flex flex-col mb-4 space-y-2">
          {features.map((item: string, i: number) => (
            <li 
              key={i} 
              className={`flex items-start gap-2 overflow-hidden transition-all duration-300 ease-in-out
                ${!expanded && i >= 4 ? 'max-h-0 opacity-0 m-0' : 'max-h-20 opacity-100'}
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
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className={`text-xs font-bold transition-colors mb-6 flex items-center gap-1 mt-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric rounded
            ${isRecommended ? 'text-brand-electric hover:text-white' : 'text-brand-electric hover:text-brand-navy'}
            `}
          >
            {expanded ? 'Ver menos' : `Ver ${features.length - 4} más...`}
            <svg className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>
        )}
      </div>
      
      <Link 
        href={`/checkout/${plan.id}`} 
        aria-label={`Comprar plan ${plan.name} por $${plan.price}`}
        className={`w-full inline-block text-center rounded-full py-3.5 font-bold text-xs uppercase tracking-wider transition-colors mt-auto shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-electric
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
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankModalTab, setBankModalTab] = useState<'no-interest' | 'with-interest'>('no-interest');

  const handleOpenBanks = (tab: 'no-interest' | 'with-interest') => {
    setBankModalTab(tab);
    setIsBankModalOpen(true);
  };
  // En caso de que no haya planes cargados de BD, renderizamos algo básico o vacío
  if (!plans || plans.length === 0) {
    return null;
  }

  // Clases estáticas para que Tailwind CSS compile correctamente las columnas
  const getGridColsClass = () => {
    if (plans.length === 1) return 'max-w-md mx-auto';
    if (plans.length === 2) return 'md:grid-cols-2 max-w-4xl mx-auto';
    if (plans.length === 3) return 'md:grid-cols-3 max-w-6xl mx-auto';
    return 'md:grid-cols-2 lg:grid-cols-4';
  };

  return (
    <section id="planes" className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-24">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy mb-3 sm:mb-4 tracking-tight">
          Planes Nutricionales
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-brand-navy/70 max-w-2xl">
          Inversiones en tu salud y rendimiento. Elige la opción que mejor se adapte a tus metas y nivel de compromiso.
        </p>
      </div>

      {/* Lista Vertical en Móvil / Grid de Precios en escritorio */}
      <div className={`flex flex-col md:grid ${getGridColsClass()} gap-6 lg:gap-4 xl:gap-6 items-stretch w-full`}>
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} onOpenBanks={handleOpenBanks} />
        ))}
      </div>

      {/* Bloque Informativo de Pagos Diferidos */}
      <div className="mt-10 sm:mt-14 bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 max-w-4xl mx-auto shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-brand-electric">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-brand-navy">
                Opciones de Diferido con Tarjeta de Crédito (Payphone)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              • <strong>Planes desde $200 USD:</strong> Puedes diferir a 3 y 6 meses <strong>sin intereses</strong> con tarjetas participantes (Pichincha, Diners, BGR, etc.).<br />
              • <strong>Planes menores a $200 USD:</strong> Opción diferida disponible <strong>con intereses</strong> según las condiciones de tu banco emisor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenBanks('no-interest')}
            className="shrink-0 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-brand-navy rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-gray-200 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4 text-brand-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Ver Bancos Aceptados
          </button>
        </div>
      </div>

      <BankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        defaultTab={bankModalTab}
      />
    </section>
  );
}
