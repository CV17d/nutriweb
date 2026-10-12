import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from './lib/logger';
import { verifySession } from './lib/auth';

// Memoria simple para Rate Limiting (No recomendado para serverless multi-instancia en prod, pero cumple Fase 0)
// Para producción con Vercel usaríamos @upstash/ratelimit con Redis
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 60; // 60 peticiones por minuto

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

  // 1. Rate Limiting aplicado solo a las rutas de API
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown-ip';
    const now = Date.now();

    const windowData = rateLimitMap.get(ip);

    if (!windowData || (now - windowData.lastReset > RATE_LIMIT_WINDOW_MS)) {
      // Nueva ventana de tiempo para esta IP
      rateLimitMap.set(ip, { count: 1, lastReset: now });
    } else {
      if (windowData.count >= MAX_REQUESTS_PER_WINDOW) {
        logger.warn({ message: 'Rate limit excedido', ip, path: pathname });
        return NextResponse.json(
          { success: false, message: 'Demasiadas peticiones. Por favor, intenta de nuevo más tarde.' },
          { status: 429 }
        );
      }
      windowData.count++;
      rateLimitMap.set(ip, windowData);
    }

    // Log de auditoría de acceso a API
    logger.info({
      message: 'API Request',
      method: request.method,
      path: pathname,
      ip
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
