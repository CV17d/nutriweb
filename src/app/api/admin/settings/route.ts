import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

const updateSettingSchema = z.object({
  key: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'La clave solo puede contener letras, números, guiones y guiones bajos'),
  value: z.any().refine(val => val !== undefined && val !== null, 'El valor es requerido'),
});

async function getHandler() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query('SELECT key, value FROM web_settings');
  const settings = result.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, any>);
  
  return NextResponse.json(settings);
}

async function putHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSettingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
  }

  const { key, value } = parsed.data;

  await query(
    `INSERT INTO web_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
    [key, value]
  );

  revalidatePath('/');
  return NextResponse.json({ success: true });
}

export const GET = withErrorHandler(getHandler);
export const PUT = withErrorHandler(putHandler);
