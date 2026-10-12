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
