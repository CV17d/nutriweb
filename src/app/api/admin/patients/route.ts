import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

const deletePatientsSchema = z.object({
  subscriptionIds: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos una suscripción'),
});

async function getHandler() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query(`
    SELECT 
      u.id, 
      u.full_name as name, 
      u.email, 
      p.name as plan_name,
      cs.sessions_remaining,
      cs.total_sessions,
      cs.status,
      cs.id as subscription_id
    FROM users u
    JOIN client_subscriptions cs ON u.id = cs.client_id
    JOIN plans p ON cs.plan_id = p.id
    ORDER BY cs.created_at DESC
  `);
  
  return NextResponse.json(result.rows);
}

async function deleteHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = deletePatientsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros inválidos', details: parsed.error.format() }, { status: 400 });
  }

  const { subscriptionIds } = parsed.data;

  // Primero borramos las citas asociadas a estas suscripciones para evitar error de foreign key
  await query('DELETE FROM appointments WHERE subscription_id = ANY($1::uuid[])', [subscriptionIds]);

  // Luego borramos las suscripciones
  await query('DELETE FROM client_subscriptions WHERE id = ANY($1::uuid[])', [subscriptionIds]);

  return NextResponse.json({ success: true });
}

export const GET = withErrorHandler(getHandler);
export const DELETE = withErrorHandler(deleteHandler);
