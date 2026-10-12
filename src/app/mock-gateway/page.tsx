"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MockGatewayContent() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const amount = searchParams.get('amount');
  const planName = searchParams.get('planName');

  const handleSimulateSuccess = () => {
    if (returnUrl) {
      window.location.href = returnUrl; // Simula redirección aprobada
    }
  };

  const handleSimulateFailure = () => {
    // Redirige simulando fallo o yendo directo a la página de error
    window.location.href = '/checkout/error?reason=payment_rejected';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Pasarela Mock</h1>
          <p className="text-blue-200 text-sm mt-1">Simulador de Pagos Local</p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm uppercase tracking-wide">Estás pagando por</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{planName || 'Plan Nutricional'}</p>
            <p className="text-4xl font-black text-blue-600 mt-2">${amount || '0.00'}</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleSimulateSuccess}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
            >
              Simular Pago Exitoso (Aprobado)
            </button>
            <button 
              onClick={handleSimulateFailure}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
            >
              Simular Pago Fallido (Rechazado)
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-8 text-center">
            Esta página solo existe en entorno de desarrollo para probar el flujo completo sin conectar Placetopay real.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando pasarela...</div>}>
      <MockGatewayContent />
    </Suspense>
  );
}
