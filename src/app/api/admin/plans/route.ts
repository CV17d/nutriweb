import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

const planBaseSchema = {
  name: z.string().trim().min(2).max(100),
  price: z.coerce.number().positive(),
  duration_months: z.coerce.number().int().positive().max(60),
  description: z.string().trim().max(2000).optional().default(''),
  total_sessions: z.coerce.number().int().positive().max(100).default(1),
  is_active: z.boolean().optional().default(true),
  is_recommended: z.boolean().optional().default(false),
  features: z.array(z.string().trim().max(255)).optional().default([]),
};

const createPlanSchema = z.object(planBaseSchema);

const updatePlanSchema = z.object({
  id: z.coerce.number().int().positive(),
  ...planBaseSchema,
});

async function getHandler() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query('SELECT * FROM plans ORDER BY price ASC');
  return NextResponse.json(result.rows);
}

async function postHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const parsed = createPlanSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
  }

  const { name, price, duration_months, description, total_sessions, is_active, is_recommended, features } = parsed.data;
  
  const result = await query(
    `INSERT INTO plans (name, price, duration_months, description, total_sessions, is_active, is_recommended, features) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, price, duration_months, description, total_sessions, is_active, is_recommended, JSON.stringify(features)]
  );

  revalidatePath('/');
  return NextResponse.json(result.rows[0]);
}

async function putHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const parsed = updatePlanSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
  }

  const { id, name, price, duration_months, description, total_sessions, is_active, is_recommended, features } = parsed.data;

  // Si se marca como recomendado, desmarcar los demás
  if (is_recommended) {
    await query('UPDATE plans SET is_recommended = false WHERE id != $1', [id]);
  }

  const result = await query(
    `UPDATE plans SET 
      name = $1, price = $2, duration_months = $3, description = $4, 
      total_sessions = $5, is_active = $6, is_recommended = $7, features = $8 
     WHERE id = $9 RETURNING *`,
    [name, price, duration_months, description, total_sessions, is_active, is_recommended, JSON.stringify(features), id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
  }

  revalidatePath('/');
  return NextResponse.json(result.rows[0]);
}

async function deleteHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawId = url.searchParams.get('id');
  const parsedId = z.coerce.number().int().positive().safeParse(rawId);

  if (!parsedId.success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const id = parsedId.data;

  // 1. Limpiar transacciones de prueba que hayan quedado pendientes o fallidas
  await query("DELETE FROM transactions WHERE plan_id = $1 AND status IN ('pending', 'failed')", [id]);

  // 2. Si hubiera transacciones exitosas pasadas, desvincular el plan_id para no perder la relación financiera
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
}

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
export const PUT = withErrorHandler(putHandler);
export const DELETE = withErrorHandler(deleteHandler);
