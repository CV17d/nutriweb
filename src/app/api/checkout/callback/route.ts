import { NextResponse } from 'next/server';
import { 
  getTransaction, 
  updateTransactionStatus, 
  claimTransactionForProcessing, 
  releaseTransactionProcessing 
} from '../../../../services/transactions';
import { createSubscription } from '../../../../services/subscriptions';
import { createAppointment } from '../../../../services/appointments';
import { payphone } from '../../../../services/payphone';
import { query } from '../../../../lib/db';
import { logger } from '../../../../lib/logger';
import { withErrorHandler } from '../../../../lib/api-handler';
import { logSecurityEvent } from '../../../../lib/security-logger';
import { getClientIp } from '../../../../lib/rate-limit';

interface ProcessCallbackParams {
  payphoneId: string | null;
  clientTransactionId: string | null;
  isPostRequest: boolean;
  request: Request;
}

async function processPaymentConfirmation({
  payphoneId,
  clientTransactionId,
  isPostRequest,
  request,
}: ProcessCallbackParams) {
  const ip = getClientIp(request);

  if (!payphoneId || !clientTransactionId) {
    logger.warn({ message: 'Callback/Webhook de Payphone recibido sin parámetros requeridos', url: request.url });
    if (isPostRequest) {
      return NextResponse.json({ success: false, message: 'Faltan parámetros requeridos (id, clientTransactionId)' }, { status: 400 });
    }
    return NextResponse.redirect(new URL('/checkout/error?reason=missing_params', request.url));
  }

  try {
    const transaction = await getTransaction(clientTransactionId);
    if (!transaction) {
      logger.error({ message: 'Transacción no encontrada en BD', clientTransactionId });
      await logSecurityEvent({
        eventType: 'SUSPICIOUS_PAYMENT_CALLBACK',
        ip,
        path: '/api/checkout/callback',
        details: { reason: 'Transaction ID does not exist', clientTransactionId, payphoneId }
      });
      if (isPostRequest) {
        return NextResponse.json({ success: false, message: 'Transacción no encontrada' }, { status: 404 });
      }
      return NextResponse.redirect(new URL('/checkout/error?reason=not_found', request.url));
    }

    const getMetadata = (t: any) => {
      if (!t?.metadata) return null;
      return typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata;
    };

    // 1. IDEMPOTENCIA: Si ya fue procesada y marcada como éxito, retornar éxito de inmediato sin duplicar
    if (transaction.status === 'success') {
      logger.info({ message: 'Transacción ya procesada previamente (idempotente)', clientTransactionId });
      if (isPostRequest) {
        return NextResponse.json({ success: true, message: 'Transacción ya procesada previamente' });
      }
      const meta = getMetadata(transaction);
      const successUrl = new URL('/checkout/success', request.url);
      if (meta?.firstAppointmentDate) successUrl.searchParams.set('date', meta.firstAppointmentDate);
      if (meta?.appointmentType) successUrl.searchParams.set('appointmentType', meta.appointmentType);
      return NextResponse.redirect(successUrl);
    }

    // 2. BLOQUEO ATÓMICO: Reclamar la transacción para procesamiento exclusivo
    const claimed = await claimTransactionForProcessing(clientTransactionId);
    if (!claimed) {
      // Si no se pudo reclamar, puede estar en proceso concurrente o ya finalizada
      const refreshed = await getTransaction(clientTransactionId);
      if (refreshed?.status === 'success') {
        if (isPostRequest) {
          return NextResponse.json({ success: true, message: 'Transacción completada concurrentemente' });
        }
        const meta = getMetadata(refreshed);
        const successUrl = new URL('/checkout/success', request.url);
        if (meta?.firstAppointmentDate) successUrl.searchParams.set('date', meta.firstAppointmentDate);
        if (meta?.appointmentType) successUrl.searchParams.set('appointmentType', meta.appointmentType);
        return NextResponse.redirect(successUrl);
      }
      // Si está en 'processing' por otra petición simultánea, esperar brevemente
      logger.warn({ message: 'Transacción en procesamiento concurrente detectada', clientTransactionId });
      if (isPostRequest) {
        return NextResponse.json({ success: true, message: 'Transacción en procesamiento' }, { status: 202 });
      }
      const meta = getMetadata(transaction);
      const successUrl = new URL('/checkout/success', request.url);
      if (meta?.firstAppointmentDate) successUrl.searchParams.set('date', meta.firstAppointmentDate);
      if (meta?.appointmentType) successUrl.searchParams.set('appointmentType', meta.appointmentType);
      return NextResponse.redirect(successUrl);
    }

    // 3. Confirmar estado real y autoritativo con la API oficial de Payphone
    // IMPORTANTE: Payphone exige que la confirmación se realice dentro de los 5 minutos.
    let confirmResult;
    try {
      confirmResult = await payphone.confirmPayment(Number(payphoneId), clientTransactionId);
    } catch (payphoneError) {
      // Liberar el estado para reintentos si hubo fallo transitorio de red
      await releaseTransactionProcessing(clientTransactionId);
      throw payphoneError;
    }

    // 4. Verificación de Integridad y Validación Criptográfica del pago
    const expectedAmountInCents = Math.round(parseFloat(transaction.amount) * 100);
    const isApproved = confirmResult.statusCode === 3 && confirmResult.transactionStatus === 'Approved';
    const isTxIdMatching = !confirmResult.clientTransactionId || String(confirmResult.clientTransactionId) === String(clientTransactionId);
    const isAmountMatching = confirmResult.amount === undefined || confirmResult.amount === expectedAmountInCents;

    if (!isApproved || !isTxIdMatching || !isAmountMatching) {
      logger.warn({ 
        message: 'Confirmación de Payphone rechazada o inconsistente', 
        confirmResult, 
        expectedAmountInCents,
        clientTransactionId 
      });

      await updateTransactionStatus(clientTransactionId, 'failed', String(payphoneId));

      await logSecurityEvent({
        eventType: 'PAYMENT_VERIFICATION_FAILED',
        ip,
        path: '/api/checkout/callback',
        details: { 
          isApproved, 
          isTxIdMatching, 
          isAmountMatching, 
          payphoneId, 
          clientTransactionId,
          receivedAmount: confirmResult.amount,
          expectedAmount: expectedAmountInCents
        }
      });

      if (isPostRequest) {
        return NextResponse.json({ success: false, message: 'Pago rechazado o inconsistente' }, { status: 400 });
      }
      return NextResponse.redirect(new URL('/checkout/error?reason=pago_no_aprobado', request.url));
    }

    // 5. Transacción aprobada: actualizar registro en la BD
    await updateTransactionStatus(clientTransactionId, 'success', String(payphoneId));

    // 6. Extraer metadata guardada al iniciar el checkout
    const meta = transaction.metadata || {};
    const clientId = meta.clientId || transaction.client_id;
    const clientName = meta.clientName || 'Cliente';
    const clientEmail = meta.clientEmail || confirmResult.email || '';
    const clientPhone = meta.clientPhone || confirmResult.phoneNumber || undefined;
    const date = meta.firstAppointmentDate;
    const appointmentType = meta.appointmentType || 'Virtual';
    const installments = transaction.installments || meta.installments || 1;

    // 7. Crear la suscripción de forma idempotente
    const subscriptionId = await createSubscription(clientId, transaction.plan_id, clientTransactionId, installments);

    // 8. Crear y agendar la 1ra cita solo si no existe ya para esta suscripción
    if (date && subscriptionId) {
      const existingAppt = await query(
        'SELECT id FROM appointments WHERE subscription_id = $1 LIMIT 1',
        [subscriptionId]
      );

      if (existingAppt.rows.length === 0) {
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
    }

    if (isPostRequest) {
      return NextResponse.json({ success: true, message: 'Pago verificado y procesado exitosamente' });
    }

    const successUrl = new URL('/checkout/success', request.url);
    if (date) successUrl.searchParams.set('date', date);
    if (appointmentType) successUrl.searchParams.set('appointmentType', appointmentType);
    
    return NextResponse.redirect(successUrl);
  } catch (error) {
    logger.error('Error procesando callback y confirmación de Payphone', error);
    // En caso de excepción, liberar el estado de bloqueo
    await releaseTransactionProcessing(clientTransactionId).catch(() => {});

    if (isPostRequest) {
      return NextResponse.json({ success: false, message: 'Error procesando confirmación de pago' }, { status: 500 });
    }
    return NextResponse.redirect(new URL('/checkout/error?reason=processing_failed', request.url));
  }
}

// Soporte para redirección GET de Payphone
async function getHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const payphoneId = searchParams.get('id');
  const clientTransactionId = searchParams.get('clientTransactionId') || searchParams.get('reference');

  return processPaymentConfirmation({
    payphoneId,
    clientTransactionId,
    isPostRequest: false,
    request,
  });
}

// Soporte para Webhook POST de Payphone
async function postHandler(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { searchParams } = new URL(request.url);
  const payphoneId = body.id || body.transactionId || searchParams.get('id');
  const clientTransactionId = body.clientTransactionId || body.clientTxId || body.reference || searchParams.get('clientTransactionId');

  return processPaymentConfirmation({
    payphoneId: payphoneId ? String(payphoneId) : null,
    clientTransactionId: clientTransactionId ? String(clientTransactionId) : null,
    isPostRequest: true,
    request,
  });
}

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
