import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'admin_session';

// Tiempos de caducidad en milisegundos
export const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 horas de inactividad máxima (permite desplazarse sin cierre repentino)
export const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 horas de duración máxima absoluta

function getEncodedJwtSecret(): Uint8Array {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }
  return new TextEncoder().encode(secretKey);
}

export interface SessionPayload {
  role: string;
  authTime: number; // Timestamp del login inicial
  lastActive: number; // Timestamp de la última actividad registrada
  [key: string]: any;
}

/**
 * Crea una nueva sesión de administración con control de expiración absoluta (8h)
 * y marca de tiempo para detección de inactividad (30 min).
 */
export async function createSession() {
  const encodedKey = getEncodedJwtSecret();
  const now = Date.now();
  const absoluteExpiresAt = new Date(now + ABSOLUTE_TIMEOUT_MS);

  const session = await new SignJWT({
    role: 'admin',
    authTime: now,
    lastActive: now,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(absoluteExpiresAt.getTime() / 1000))
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: absoluteExpiresAt,
    sameSite: 'lax',
    path: '/',
  });

  return session;
}

/**
 * Verifica criptográficamente el token y valida que no haya excedido
 * la inactividad de 30 minutos ni el tope absoluto de 8 horas.
 */
export async function verifySession(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    if (!session) return null;
    const encodedKey = getEncodedJwtSecret();
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
      clockTolerance: 60, // Tolerancia de 60 segundos ante posibles desfases de reloj entre servidores/servicios
    });

    const now = Date.now();
    const authTime = Number(payload.authTime || (payload.iat ? Number(payload.iat) * 1000 : now));
    const lastActive = Number(payload.lastActive || authTime);

    // 1. Control de expiración absoluta (máximo 8 horas desde el login inicial)
    if (now - authTime > ABSOLUTE_TIMEOUT_MS) {
      console.warn('[AUTH] Sesión expirada por límite absoluto (8h)');
      return null;
    }

    // 2. Control de inactividad (máximo 2 horas sin solicitudes)
    if (now - lastActive > INACTIVITY_TIMEOUT_MS) {
      console.warn('[AUTH] Sesión expirada por inactividad (2h)');
      return null;
    }

    return {
      role: String(payload.role || 'client'),
      authTime,
      lastActive,
      ...payload,
    };
  } catch (error: any) {
    console.error('[AUTH ERROR] Error validando sesión JWT:', error?.message || error);
    return null;
  }
}

/**
 * Refresca la marca de última actividad si la sesión sigue viva y ha pasado un umbral razonable
 */
export async function signRefreshedSession(currentPayload: SessionPayload): Promise<string> {
  const encodedKey = getEncodedJwtSecret();
  const now = Date.now();
  const absoluteExpiresAt = new Date(currentPayload.authTime + ABSOLUTE_TIMEOUT_MS);

  return await new SignJWT({
    role: currentPayload.role,
    authTime: currentPayload.authTime,
    lastActive: now,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(absoluteExpiresAt.getTime() / 1000))
    .sign(encodedKey);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return null;
  return await verifySession(session);
}

/**
 * Validador estricto para Defense in Depth en rutas y layouts administrativos
 */
export async function requireAdminSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return null;
  }
  return session;
}
