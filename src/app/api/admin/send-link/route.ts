import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendSubscriptionLinkEmail } from '../../../../services/email';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

const sendLinkSchema = z.object({
  user_id: z.string().uuid('ID de usuario inválido'),
  subscription_id: z.string().uuid('ID de suscripción inválido'),
});

async function postHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sendLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros inválidos', details: parsed.error.format() }, { status: 400 });
  }

  const { user_id, subscription_id } = parsed.data;

  const userResult = await query(
    'SELECT u.full_name as name, u.email, p.name as plan_name, cs.sessions_used, cs.total_sessions FROM users u JOIN client_subscriptions cs ON u.id = cs.client_id JOIN plans p ON cs.plan_id = p.id WHERE u.id = $1 AND cs.id = $2',
    [user_id, subscription_id]
  );
  const user = userResult.rows[0];
  
  if (!user) {
    return NextResponse.json({ error: 'Usuario o suscripción no encontrados' }, { status: 404 });
  }

  await sendSubscriptionLinkEmail(
    user.email,
    user.name,
    subscription_id,
    user.plan_name,
    user.sessions_used,
    user.total_sessions
  );

  return NextResponse.json({ success: true, message: 'Enlace enviado con éxito' });
}

export const POST = withErrorHandler(postHandler);
