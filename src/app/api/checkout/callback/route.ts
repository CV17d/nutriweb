import { NextResponse } from 'next/server';
import { getTransaction, updateTransactionStatus } from '../../../../services/transactions';
import { createSubscription } from '../../../../services/subscriptions';
import { createAppointment } from '../../../../services/appointments';
import { payphone } from '../../../../services/payphone';
import { logger } from '../../../../lib/logger';
import { withErrorHandler } from '../../../../lib/api-handler';

async function callbackHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Payphone redirige con 'id' y 'clientTransactionId'
  const payphoneId = searchParams.get('id');
  const clientTransactionId = searchParams.get('clientTransactionId') || searchParams.get('reference');

  if (!payphoneId || !clientTransactionId) {
    logger.warn({ message: 'Callback recibido sin parámetros requeridos', url: request.url });
    return NextResponse.redirect(new URL('/checkout/error?reason=missing_params', request.url));
  }

  try {
    const transaction = await getTransaction(clientTransactionId);
    if (!transaction) {
      logger.error({ message: 'Transacción no encontrada en BD', clientTransactionId });
      return NextResponse.redirect(new URL('/checkout/error?reason=not_found', request.url));
    }

    if (transaction.status === 'success') {
      // Ya fue procesada anteriormente
      return NextResponse.redirect(new URL('/checkout/success', request.url));
    }

    // 1. Confirmar estado real con la API de Payphone
    // IMPORTANTE: Si no se confirma en 5 minutos, Payphone efectúa reverso automático.
    const confirmResult = await payphone.confirmPayment(Number(payphoneId), clientTransactionId);

    // statusCode 3 = Approved en Payphone
    if (confirmResult.statusCode !== 3 && confirmResult.transactionStatus !== 'Approved') {
      logger.warn({ message: 'Transacción cancelada o rechazada en Payphone', confirmResult });
      await updateTransactionStatus(clientTransactionId, 'failed', String(payphoneId));
      return NextResponse.redirect(new URL('/checkout/error?reason=pago_no_aprobado', request.url));
    }

    // 2. Transacción aprobada: actualizar registro en la BD
    await updateTransactionStatus(clientTransactionId, 'success', String(payphoneId));

    // 3. Extraer metadata guardada al momento de iniciar el checkout
    const meta = transaction.metadata || {};
    const clientId = meta.clientId || transaction.client_id;
    const clientName = meta.clientName || 'Cliente';
    const clientEmail = meta.clientEmail || confirmResult.email || '';
    const clientPhone = meta.clientPhone || confirmResult.phoneNumber || undefined;
    const date = meta.firstAppointmentDate;
    const appointmentType = meta.appointmentType || 'Virtual';

    // 4. Crear la suscripción del cliente
    const subscriptionId = await createSubscription(clientId, transaction.plan_id, clientTransactionId);

    // 5. Crear y agendar la 1ra cita
    if (date) {
      await createAppointment({
        clientId,
        clientName,
        clientEmail,
        clientPhone,
        date: new Date(date),
        isFreeConsultation: false,
        subscriptionId,
        appointmentType,
      });
    }

    const successUrl = new URL('/checkout/success', request.url);
    if (date) successUrl.searchParams.set('date', date);
    if (appointmentType) successUrl.searchParams.set('appointmentType', appointmentType);
    
    return NextResponse.redirect(successUrl);
  } catch (error) {
    logger.error('Error procesando callback y confirmación de Payphone', error);
    return NextResponse.redirect(new URL('/checkout/error?reason=processing_failed', request.url));
  }
}

export const GET = withErrorHandler(callbackHandler);
