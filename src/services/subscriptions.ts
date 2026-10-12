import { query } from '../lib/db';
import { logger } from '../lib/logger';

export async function createSubscription(clientId: string, planId: number, transactionId: string) {
  // Primero obtenemos el total de sesiones del plan
  const planQuery = await query('SELECT total_sessions FROM plans WHERE id = $1', [planId]);
  
  if (planQuery.rows.length === 0) {
    throw new Error('Plan no encontrado');
  }

  const totalSessions = planQuery.rows[0].total_sessions;

  const insertQuery = `
    INSERT INTO client_subscriptions (client_id, plan_id, transaction_id, total_sessions, sessions_remaining, sessions_used, status)
    VALUES ($1, $2, $3, $4, $5, 0, 'active')
    ON CONFLICT (transaction_id) DO NOTHING
    RETURNING id;
  `;

  const result = await query(insertQuery, [clientId, planId, transactionId, totalSessions, totalSessions]);
  let subscriptionId = result.rows[0]?.id;
  
  if (!subscriptionId) {
    // Si ya existía debido a una ejecución concurrente idempotente, recuperamos su ID
    const existing = await query('SELECT id FROM client_subscriptions WHERE transaction_id = $1', [transactionId]);
    subscriptionId = existing.rows[0]?.id;
  }
  
  logger.info({ message: 'Suscripción procesada exitosamente', subscriptionId, clientId, transactionId });
  return subscriptionId;
}

export async function getActiveSubscription(clientId: string) {
  const q = `
    SELECT * FROM client_subscriptions 
    WHERE client_id = $1 AND status = 'active' AND sessions_remaining > 0
    ORDER BY created_at ASC
    LIMIT 1;
  `;
  const result = await query(q, [clientId]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getSubscriptionById(id: string) {
  const q = `
    SELECT s.*, p.name as plan_name, u.full_name as client_name, u.email as client_email 
    FROM client_subscriptions s
    JOIN plans p ON s.plan_id = p.id
    JOIN users u ON s.client_id = u.id
    WHERE s.id = $1;
  `;
  const result = await query(q, [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function consumeSession(subscriptionId: string) {
  // Actualización segura y atómica para evitar race conditions
  const updateQuery = `
    UPDATE client_subscriptions
    SET 
      sessions_remaining = sessions_remaining - 1,
      sessions_used = sessions_used + 1,
      updated_at = CURRENT_TIMESTAMP,
      status = CASE WHEN sessions_remaining - 1 <= 0 THEN 'completed' ELSE status END
    WHERE id = $1 AND sessions_remaining > 0 AND status = 'active'
    RETURNING id, sessions_remaining;
  `;
  
  const result = await query(updateQuery, [subscriptionId]);
  
  if (result.rowCount === 0) {
    throw new Error('No hay sesiones disponibles en esta suscripción o ya está inactiva');
  }

  logger.info({ message: 'Sesión consumida de la suscripción', subscriptionId, remaining: result.rows[0].sessions_remaining });
  return result.rows[0];
}
