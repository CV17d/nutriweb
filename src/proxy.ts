import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from './lib/logger';
import { verifySession, signRefreshedSession, COOKIE_NAME } from './lib/auth';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionValue = request.cookies.get(COOKIE_NAME)?.value;

  // Si intentan acceder a la antigua ruta /admin, responder 404 para no dar indicios de existencia
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Protect /gestion-andres routes (except /gestion-andres/login)
  if (pathname.startsWith('/gestion-andres') && !pathname.startsWith('/gestion-andres/login')) {
    if (!sessionValue) {
      return NextResponse.redirect(new URL('/gestion-andres/login', request.url));
    }
  }

  // Deslizamiento de sesión (Sliding Session): refrescar si la sesión es válida y pasaron > 5 min de actividad
  let refreshedToken: string | null = null;
  if (sessionValue && pathname.startsWith('/gestion-andres')) {
    const verified = await verifySession(sessionValue);
    if (verified && Date.now() - verified.lastActive > 5 * 60 * 1000) {
      try {
        refreshedToken = await signRefreshedSession(verified);
      } catch (err) {
        logger.error('Error refrescando sesión deslizante en proxy', err);
      }
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

  // Si se refrescó la sesión, actualizar la cookie en la respuesta HTTP
  if (refreshedToken) {
    response.cookies.set(COOKIE_NAME, refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 horas
    });
  }
  
  return response;
}

export const config = {
  // Se ejecuta el proxy en las rutas del panel y captura de la antigua ruta admin
  matcher: ['/admin', '/admin/:path*', '/gestion-andres', '/gestion-andres/:path*'],
};
