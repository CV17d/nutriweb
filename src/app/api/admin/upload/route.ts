import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAdminSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const ALLOWED_BUCKETS = new Set(['images', 'avatars', 'content']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB máximo

/**
 * Valida firmas de bytes (magic bytes) para prevenir archivos maliciosos camuflados
 */
function isValidImageMagicBytes(buffer: Buffer, mime: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (mime === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (mime === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WebP: RIFF (bytes 0-3) y WEBP (bytes 8-11)
  if (mime === 'image/webp') {
    const riff = buffer.subarray(0, 4).toString('ascii');
    const webp = buffer.subarray(8, 12).toString('ascii');
    return riff === 'RIFF' && webp === 'WEBP';
  }

  return false;
}

async function uploadHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const rawBucket = (formData.get('bucket') as string) || 'images';

  // 1. Validar lista blanca de buckets
  const bucket = ALLOWED_BUCKETS.has(rawBucket) ? rawBucket : 'images';

  if (!file) {
    return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
  }

  // 2. Validar tamaño de archivo
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'El archivo excede el tamaño máximo permitido de 5MB' },
      { status: 400 }
    );
  }

  // 3. Validar tipo MIME reportado
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no permitido. Solo se aceptan imágenes JPEG, PNG o WebP' },
      { status: 400 }
    );
  }

  // 4. Validar extensión de archivo
  const filename = file.name;
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: 'Extensión de archivo no permitida. Solo se aceptan extensiones .jpg, .jpeg, .png, .webp' },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 5. Validar magic numbers (contenido binario real)
  if (!isValidImageMagicBytes(buffer, file.type)) {
    return NextResponse.json(
      { error: 'El contenido del archivo no coincide con un formato de imagen válido' },
      { status: 400 }
    );
  }

  const uniqueName = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabaseAdmin
    .storage
    .from(bucket)
    .upload(uniqueName, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    return NextResponse.json({ error: 'Error al almacenar el archivo' }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin
    .storage
    .from(bucket)
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}

export const POST = withErrorHandler(uploadHandler);
