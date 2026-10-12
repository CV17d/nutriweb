import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from './lib/logger';
import { verifySession } from './lib/auth';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get('admin_session')?.value;
    const verified = await verifySession(session);
    
    if (!verified) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect /api/admin routes (except /api/admin/login)
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
    const session = request.cookies.get('admin_session')?.value;
    const verified = await verifySession(session);
    
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Log de auditoría de acceso a rutas protegidas y APIs
  if (pathname.startsWith('/api/')) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown-ip';
    logger.info({
      message: 'API Request',
      method: request.method,
      path: pathname,
      ip,
    });
  }

  // Agrega headers de seguridad básicos
  const response = NextResponse.next();
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  // Se ejecuta el proxy en todas las rutas bajo /admin y /api
  matcher: ['/admin/:path*', '/api/:path*'],
};
