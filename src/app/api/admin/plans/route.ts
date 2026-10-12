import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query('SELECT * FROM plans ORDER BY price ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, price, duration_months, description, total_sessions, is_active, is_recommended, features } = data;
    
    const result = await query(
      `INSERT INTO plans (name, price, duration_months, description, total_sessions, is_active, is_recommended, features) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, price, duration_months, description, total_sessions, is_active ?? true, is_recommended ?? false, features ? JSON.stringify(features) : '[]']
    );

    revalidatePath('/');
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, name, price, duration_months, description, total_sessions, is_active, is_recommended, features } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Si se marca como recomendado, podríamos querer desmarcar los demás
    if (is_recommended) {
      await query('UPDATE plans SET is_recommended = false WHERE id != $1', [id]);
    }

    const result = await query(
      `UPDATE plans SET 
        name = $1, price = $2, duration_months = $3, description = $4, 
        total_sessions = $5, is_active = $6, is_recommended = $7, features = $8 
       WHERE id = $9 RETURNING *`,
      [name, price, duration_months, description, total_sessions, is_active ?? true, is_recommended ?? false, features ? JSON.stringify(features) : '[]', id]
    );

    revalidatePath('/');
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // 1. Limpiar transacciones de prueba que hayan quedado pendientes o fallidas
    await query("DELETE FROM transactions WHERE plan_id = $1 AND status IN ('pending', 'failed')", [id]);

    // 2. Si hubiera transacciones exitosas pasadas, desvincular el plan_id para no perder el dinero
    await query('UPDATE transactions SET plan_id = NULL WHERE plan_id = $1', [id]);
    await query('UPDATE client_subscriptions SET plan_id = NULL WHERE plan_id = $1', [id]);

    // 3. Eliminar el plan definitivamente de la base de datos
    const result = await query('DELETE FROM plans WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'El plan no existe' }, { status: 404 });
    }

    revalidatePath('/');
    return NextResponse.json({ 
      success: true, 
      message: 'Plan eliminado definitivamente.' 
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
