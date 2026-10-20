import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

const createCaseSchema = z.object({
  patient_name: z.string().trim().min(2).max(100),
  comment: z.string().trim().min(5).max(2000),
  metrics: z.string().trim().max(255).optional().default(''),
  image_url: z.string().trim().max(1000).optional().default(''),
  before_image_url: z.string().trim().max(1000).optional().default(''),
  after_image_url: z.string().trim().max(1000).optional().default(''),
  rating: z.number().int().min(1).max(5).optional().default(5),
});

const updateCaseSchema = z.object({
  id: z.number().int().positive(),
  patient_name: z.string().trim().min(2).max(100),
  comment: z.string().trim().min(5).max(2000),
  metrics: z.string().trim().max(255).optional().default(''),
  image_url: z.string().trim().max(1000).optional().default(''),
  before_image_url: z.string().trim().max(1000).optional().default(''),
  after_image_url: z.string().trim().max(1000).optional().default(''),
  rating: z.number().int().min(1).max(5).optional().default(5),
});

async function getHandler() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query('SELECT * FROM success_cases ORDER BY created_at DESC');
  return NextResponse.json(result.rows);
}

async function postHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCaseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
  }

  const { patient_name, comment, metrics, image_url, before_image_url, after_image_url, rating } = parsed.data;

  const result = await query(
    'INSERT INTO success_cases (patient_name, comment, metrics, image_url, rating, before_image_url, after_image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [patient_name, comment, metrics, image_url, rating, before_image_url, after_image_url]
  );

  revalidatePath('/');
  return NextResponse.json(result.rows[0]);
}

async function putHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateCaseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
  }

  const { id, patient_name, comment, metrics, image_url, before_image_url, after_image_url, rating } = parsed.data;

  const result = await query(
    'UPDATE success_cases SET patient_name = $1, comment = $2, metrics = $3, image_url = $4, rating = $5, before_image_url = $6, after_image_url = $7 WHERE id = $8 RETURNING *',
    [patient_name, comment, metrics, image_url, rating, before_image_url, after_image_url, id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 });
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

  const result = await query('DELETE FROM success_cases WHERE id = $1', [parsedId.data]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 });
  }

  revalidatePath('/');
  return NextResponse.json({ success: true });
}

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
export const PUT = withErrorHandler(putHandler);
export const DELETE = withErrorHandler(deleteHandler);
