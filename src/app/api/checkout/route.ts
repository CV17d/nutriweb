import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '../../../lib/api-handler';
import { createTransaction } from '../../../services/transactions';
import { query } from '../../../lib/db';
import { logger } from '../../../lib/logger';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '../../../lib/rate-limit';

const checkoutSchema = z.object({
  planId: z.number(),
  clientId: z.string().uuid().optional(),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  clientIdId: z.string().optional(),
  firstAppointmentDate: z.string().datetime(), // Fecha para la 1ra cita
  appointmentType: z.enum(['Presencial', 'Virtual']).default('Virtual'),
  paymentType: z.enum(['current', 'deferred']).default('current'),
  installments: z.number().int().min(1).max(24).default(1),
});

async function postHandler(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`checkout:${ip}`, 10, 10 * 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, message: 'Demasiadas solicitudes de compra iniciadas. Por favor, espera unos minutos.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
  }

  const { 
    planId, 
    clientName, 
    clientEmail, 
    clientPhone, 
    clientIdId, 
    firstAppointmentDate, 
    appointmentType,
    paymentType,
    installments,
  } = parsed.data;

  const effectiveInstallments = paymentType === 'deferred' && installments > 1 ? installments : 1;
  const isDeferred = paymentType === 'deferred' || effectiveInstallments > 1;
  
  let clientId: string = parsed.data.clientId || '';
  
  if (!clientId) {
    // Buscar si el usuario ya existe por email
    const userQuery = await query('SELECT id FROM users WHERE email = $1', [clientEmail]);
    
    if (userQuery.rows.length > 0) {
      clientId = userQuery.rows[0].id;
    } else {
      // Crear un usuario nuevo
      clientId = crypto.randomUUID();
      await query(
        'INSERT INTO users (id, email, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [clientId, clientEmail, clientName, 'no_password', 'client']
      );
    }
  }

  // Obtener detalles del plan
  const planQuery = await query('SELECT * FROM plans WHERE id = $1', [planId]);
  if (planQuery.rows.length === 0) {
    return NextResponse.json({ success: false, message: 'Plan no encontrado' }, { status: 404 });
  }
  const plan = planQuery.rows[0];

  const planPriceNumber = parseFloat(plan.price);
  const amountInCents = Math.round(planPriceNumber * 100);

  // Metadata completa de la cita, el cliente y cuotas para asociar a la transacción
  const metadata = {
    clientId,
    clientName,
    clientEmail,
    clientPhone: clientPhone || '',
    clientIdId: clientIdId || '',
    firstAppointmentDate,
    appointmentType,
    planName: plan.name,
    totalSessions: plan.total_sessions || 1,
    installments: effectiveInstallments,
    paymentType: isDeferred ? 'deferred' : 'current',
  };

  // Crear la transacción con estado pending, metadatos y cuotas
  const transactionId = await createTransaction(
    clientId, 
    planId, 
    planPriceNumber, 
    metadata, 
    effectiveInstallments
  );

  logger.info({ 
    message: 'Transacción creada para Payphone', 
    transactionId, 
    planName: plan.name,
    isDeferred,
    installments: effectiveInstallments 
  });

  // Preparar la carga útil de la transacción de Payphone (sin exponer secretos del servidor)
  const payphoneConfig: any = {
    clientTransactionId: transactionId,
    amount: amountInCents,
    amountWithoutTax: amountInCents,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    currency: 'USD',
    storeId: process.env.PAYPHONE_STORE_ID || '',
    reference: `Plan ${plan.name} - ${clientName}${isDeferred ? ` (${effectiveInstallments} cuotas)` : ''}`.slice(0, 100),
    phoneNumber: clientPhone || '',
    email: clientEmail,
    documentId: clientIdId || '',
    identificationType: clientIdId && clientIdId.length === 13 ? 2 : 1, // 1: Cédula, 2: RUC
    lang: 'es',
    defaultMethod: 'card',
    timeZone: -5,
    responseUrl: `${process.env.NEXTAUTH_URL || 'https://www.andresburbanonutricionista.com'}/api/checkout/callback`,
    cancellationUrl: `${process.env.NEXTAUTH_URL || 'https://www.andresburbanonutricionista.com'}/checkout/error`,
  };

  // Inyección de parámetros de pago diferido para la API v3 y Cajita de Payphone
  if (isDeferred) {
    const isNoInterestEligible = planPriceNumber >= 200;
    payphoneConfig.deferred = true;
    payphoneConfig.deferredMonths = effectiveInstallments;
    // Payphone: tipo 2 = sin intereses (mínimo $200), tipo 1 = con intereses
    payphoneConfig.deferredType = isNoInterestEligible ? 2 : 1;
    payphoneConfig.deferredConfiguration = {
      months: effectiveInstallments,
      type: isNoInterestEligible ? 'without-interest' : 'with-interest',
    };
    payphoneConfig.deferredOptions = {
      months: effectiveInstallments,
      type: isNoInterestEligible ? 2 : 1,
    };
  }

  return NextResponse.json({
    success: true,
    transactionId,
    payphone: payphoneConfig,
  });
}

export const POST = withErrorHandler(postHandler);
