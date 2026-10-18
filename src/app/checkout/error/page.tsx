"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CheckoutErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  let errorMessage = 'Ocurrió un error inesperado al procesar tu pago o cita.';
  
  if (reason === 'payment_rejected') {
    errorMessage = 'El pago fue rechazado o cancelado. No se han realizado cargos en tu cuenta.';
  } else if (reason === 'missing_params' || reason === 'not_found') {
    errorMessage = 'No se pudo validar la referencia de la transacción.';
  } else if (reason === 'processing_failed') {
    errorMessage = 'El pago pudo haber sido exitoso, pero ocurrió un error interno al crear tu suscripción o cita. Por favor, contáctanos.';
  }

  return (
    <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">Error en la Compra</h1>
      <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
        {errorMessage}
      </p>

      <Link href="/" replace className="inline-block w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 sm:px-8 rounded-xl transition-colors text-sm sm:text-base">
        Volver al Inicio e Intentar de Nuevo
      </Link>
    </div>
  );
}

export default function CheckoutErrorPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <Suspense fallback={<div>Cargando...</div>}>
        <CheckoutErrorContent />
      </Suspense>
    </div>
  );
}
