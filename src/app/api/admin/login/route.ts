import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSession } from '../../../../lib/auth';
import { checkRateLimit, getClientIp } from '../../../../lib/rate-limit';
import { withErrorHandler } from '../../../../lib/api-handler';

/**
 * Comparación segura en tiempo constante usando SHA-256 para evitar Timing Attacks.
 */
function safeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Retraso deliberado (Tarpit) para ralentizar ataques automatizados de fuerza bruta.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function loginHandler(request: Request) {
  const ip = getClientIp(request);

  // 1. Rate Limiting persistente en BD: máximo 5 intentos en 15 minutos por IP
  const rateLimit = await checkRateLimit(`login:${ip}`, 5, 15 * 60);
  if (!rateLimit.success) {
    await delay(1500);
    return NextResponse.json(
      { error: 'Demasiados intentos fallidos. Acceso bloqueado temporalmente por 15 minutos.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body;

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'La contraseña es requerida' }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: 'Error en la configuración del servidor' }, { status: 500 });
  }

  // 2. Mitigación de Timing Attacks con crypto.timingSafeEqual
  const isPasswordValid = safeCompare(password, adminPassword);

  if (!isPasswordValid) {
    // 3. Tarpit: demorar deliberadamente la respuesta incorrecta
    await delay(1200);
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  // Passwords match, create session
  await createSession();

  return NextResponse.json({ success: true });
}

export const POST = withErrorHandler(loginHandler);
