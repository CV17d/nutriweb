import { NextResponse } from 'next/server';
import { sendSubscriptionLinkEmail } from '../../../../services/email';
import { query } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const { user_id, subscription_id } = await request.json();
    
    if (!user_id || !subscription_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const userResult = await query('SELECT u.full_name as name, u.email, p.name as plan_name, cs.sessions_used, cs.total_sessions FROM users u JOIN client_subscriptions cs ON u.id = cs.client_id JOIN plans p ON cs.plan_id = p.id WHERE u.id = $1 AND cs.id = $2', [user_id, subscription_id]);
    const user = userResult.rows[0];
    
    if (!user) {
      return NextResponse.json({ error: 'User or subscription not found' }, { status: 404 });
    }

    await sendSubscriptionLinkEmail(
      user.email,
      user.name,
      subscription_id,
      user.plan_name,
      user.sessions_used,
      user.total_sessions
    );

    return NextResponse.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Error sending link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
