import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si intentan acceder a la antigua ruta /admin, responder 404 para no dar indicios de existencia
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  // Se ejecuta el proxy exclusivamente para ocultar la antigua ruta admin
  matcher: ['/admin', '/admin/:path*'],
};
