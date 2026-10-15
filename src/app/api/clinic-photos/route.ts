import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { withErrorHandler } from '../../../lib/api-handler';

async function getHandler() {
  const result = await query(
    'SELECT id, image_url, caption, display_order FROM clinic_photos WHERE is_active = true ORDER BY display_order ASC, created_at ASC'
  );
  return NextResponse.json(result.rows);
}

export const GET = withErrorHandler(getHandler);
