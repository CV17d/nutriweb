import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET() {
  try {
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
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { subscriptionIds, password } = await request.json();

    if (!subscriptionIds || !Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
      return NextResponse.json({ error: 'Invalid subscription IDs' }, { status: 400 });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Contraseña maestra incorrecta' }, { status: 401 });
    }

    // Primero borramos las citas asociadas a estas suscripciones para evitar error de foreign key
    await query('DELETE FROM appointments WHERE subscription_id = ANY($1::uuid[])', [subscriptionIds]);

    // Luego borramos las suscripciones (esto quita al paciente del panel de esta tabla)
    await query('DELETE FROM client_subscriptions WHERE id = ANY($1::uuid[])', [subscriptionIds]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
