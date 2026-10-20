import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { deleteSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

async function logoutHandler() {
  await deleteSession();
  return NextResponse.json({ success: true });
}

export const POST = withErrorHandler(logoutHandler);
