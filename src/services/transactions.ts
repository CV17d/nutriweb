import { query } from '../lib/db';
import { logger } from '../lib/logger';

export async function createTransaction(clientId: string, planId: number, amount: number, metadata?: any) {
  const insertQuery = `
    INSERT INTO transactions (client_id, plan_id, amount, status, metadata)
    VALUES ($1, $2, $3, 'pending', $4)
    RETURNING id;
  `;
  const result = await query(insertQuery, [clientId, planId, amount, metadata ? JSON.stringify(metadata) : null]);
  return result.rows[0].id;
}

/**
 * Reclama atómicamente una transacción para procesamiento exclusivo,
 * previniendo condiciones de carrera y dobles cobros (idempotencia estricta).
 */
export async function claimTransactionForProcessing(transactionId: string): Promise<boolean> {
  const claimQuery = `
    UPDATE transactions
    SET status = 'processing'
    WHERE id = $1 AND status = 'pending'
    RETURNING id;
  `;
  const result = await query(claimQuery, [transactionId]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Libera una transacción que falló en su proceso previo devolviéndola a 'pending'
 * solo si no fue completada ni marcada como fallo definitivo.
 */
export async function releaseTransactionProcessing(transactionId: string): Promise<void> {
  await query(
    `UPDATE transactions SET status = 'pending' WHERE id = $1 AND status = 'processing'`,
    [transactionId]
  );
}

export async function updateTransactionStatus(transactionId: string, status: 'success' | 'failed', gatewayPaymentId?: string) {
  const updateQuery = `
    UPDATE transactions
    SET status = $2, gateway_payment_id = $3
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(updateQuery, [transactionId, status, gatewayPaymentId || null]);
  return result.rows[0];
}

export async function getTransaction(transactionId: string) {
  const result = await query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
  return result.rows.length > 0 ? result.rows[0] : null;
}
