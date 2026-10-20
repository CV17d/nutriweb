'use client';

import { useState } from 'react';

export const NO_INTEREST_BANKS = [
  { name: 'Banco Pichincha', cards: 'Discover · Mastercard · Visa' },
  { name: 'Banco Diners Club del Ecuador, S.A.', cards: 'Diners Club International · Discover · Mastercard · Visa' },
  { name: 'Interdin', cards: 'Diners Club International · Discover · Mastercard · Visa' },
  { name: 'BGR (Banco General Rumiñahui)', cards: 'Visa' },
  { name: 'Banco Rumiñahui', cards: 'Visa' },
  { name: 'Banco Comercial de Manabí', cards: 'Visa' },
  { name: 'Banco de Loja', cards: 'Visa' },
  { name: 'Cooperativa Andalucía', cards: 'Visa' },
  { name: 'Banco Pichincha (PA)', cards: 'Diners Club International' },
];

export const WITH_INTEREST_BANKS = [
  { name: 'Banco Pichincha', cards: 'Discover · Mastercard · Visa' },
  { name: 'Banco Diners Club del Ecuador, S.A.', cards: 'Diners Club International · Discover · Mastercard · Visa' },
  { name: 'Interdin', cards: 'Diners Club International · Discover · Mastercard · Visa' },
  { name: 'Banco Bolivariano', cards: 'Mastercard · Visa' },
  { name: 'Produbanco / Promerica', cards: 'Mastercard · Visa' },
  { name: 'Banco Internacional', cards: 'Mastercard · Visa' },
  { name: 'Banco de Machala', cards: 'Mastercard · Visa' },
  { name: 'Banco Solidario', cards: 'Visa' },
  { name: 'Banco de Loja', cards: 'Visa' },
  { name: 'Banco Comercial de Manabí', cards: 'Visa' },
  { name: 'Banco Amazonas', cards: 'Visa' },
  { name: 'BGR (Banco General Rumiñahui)', cards: 'Visa' },
  { name: 'Banco Rumiñahui', cards: 'Visa' },
  { name: 'Banco Pichincha (PA)', cards: 'Diners Club International' },
  { name: 'Cooperativa JEP (Juventud Ecuatoriana Progresista)', cards: 'Mastercard · Visa' },
  { name: 'Cooperativa Andalucía', cards: 'Visa' },
  { name: 'Mutualista Pichincha', cards: 'Mastercard' },
  { name: 'Mutualista Azuay', cards: 'Visa' },
  { name: 'Coop. Educadores de Loja', cards: 'Visa' },
  { name: 'Coop. Grameen Amazonas', cards: 'Visa' },
  { name: 'Coop. Pequeña Empresa de Loja (CACPE)', cards: 'Visa' },
  { name: 'Coop. Obras Públicas Fiscales de Loja', cards: 'Visa' },
];

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'no-interest' | 'with-interest';
}

export default function BankModal({ isOpen, onClose, defaultTab = 'no-interest' }: BankModalProps) {
  const [activeTab, setActiveTab] = useState<'no-interest' | 'with-interest'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-lg text-brand-navy">
              Bancos Aceptados en Payphone
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tarjetas de crédito locales habilitadas para diferidos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('no-interest')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'no-interest'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Sin Intereses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('with-interest')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'with-interest'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Con Intereses
          </button>
        </div>

        {/* Context Note */}
        <div className="px-5 py-3 text-xs leading-relaxed bg-slate-50 border-b border-gray-100">
          {activeTab === 'no-interest' ? (
            <div className="text-emerald-900 bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl">
              <strong>Plazos sin recargo:</strong> 3 meses (desde $200 USD) y 6 meses (desde $250 USD). Disponible en los planes <em>Performance</em> y <em>Elite</em>.
            </div>
          ) : (
            <div className="text-blue-900 bg-blue-50 border border-blue-200/80 p-2.5 rounded-xl">
              <strong>Plazos con intereses:</strong> 3 y 6 meses. Aplica para planes menores a $200 (como <em>Básico</em> y <em>Esencial</em>). La tasa de interés depende del contrato con tu banco emisor.
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
          {(activeTab === 'no-interest' ? NO_INTEREST_BANKS : WITH_INTEREST_BANKS).map((bank, idx) => (
            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="font-semibold text-xs sm:text-sm text-gray-800">
                {bank.name}
              </span>
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block w-fit">
                {bank.cards}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-navy hover:bg-black text-white text-xs font-bold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
