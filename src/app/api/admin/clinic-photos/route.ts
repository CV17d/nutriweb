import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

const createPhotoSchema = z.object({
  image_url: z.string().trim().min(5).max(1000),
  caption: z.string().trim().max(255).optional().default(''),
  display_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

const updatePhotoSchema = z.object({
  id: z.number().int().positive(),
  image_url: z.string().trim().min(5).max(1000).optional(),
  caption: z.string().trim().max(255).optional(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

async function getHandler() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query(
    'SELECT * FROM clinic_photos ORDER BY display_order ASC, created_at ASC'
  );
  return NextResponse.json(result.rows);
}

async function postHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPhotoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { image_url, caption, display_order, is_active } = parsed.data;

  const result = await query(
    `INSERT INTO clinic_photos (image_url, caption, display_order, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [image_url, caption, display_order, is_active]
  );

  revalidatePath('/');
  return NextResponse.json(result.rows[0], { status: 201 });
}

async function putHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updatePhotoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { id, image_url, caption, display_order, is_active } = parsed.data;

  // Actualizar solo los campos que vengan definidos
  const currentResult = await query('SELECT * FROM clinic_photos WHERE id = $1', [id]);
  if (currentResult.rowCount === 0) {
    return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 });
  }

  const current = currentResult.rows[0];
  const newImageUrl = image_url !== undefined ? image_url : current.image_url;
  const newCaption = caption !== undefined ? caption : current.caption;
  const newOrder = display_order !== undefined ? display_order : current.display_order;
  const newIsActive = is_active !== undefined ? is_active : current.is_active;

  const result = await query(
    `UPDATE clinic_photos 
     SET image_url = $1, caption = $2, display_order = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [newImageUrl, newCaption, newOrder, newIsActive, id]
  );

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

  const result = await query('DELETE FROM clinic_photos WHERE id = $1 RETURNING id', [parsedId.data]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 });
  }

  revalidatePath('/');
  return NextResponse.json({ success: true, id: parsedId.data });
}

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
export const PUT = withErrorHandler(putHandler);
export const DELETE = withErrorHandler(deleteHandler);
