import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { deleteSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';

async function logoutHandler() {
  await deleteSession();
  return NextResponse.json({ success: true });
}

async function logoutGetHandler(request: Request) {
  await deleteSession();
  return NextResponse.redirect(new URL('/gestion-andres/login', request.url));
}

export const POST = withErrorHandler(logoutHandler);
export const GET = withErrorHandler(logoutGetHandler);
