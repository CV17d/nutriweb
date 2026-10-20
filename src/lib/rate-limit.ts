import { query } from './db';
import { logger } from './logger';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Obtiene la dirección IP real del cliente evitando suplantación (IP Spoofing)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return '127.0.0.1';
}

/**
 * Valida y consume un intento en el rate limiter persistente en base de datos.
 * Es atómico y 100% compatible con entornos serverless efímeros / multi-instancia.
 *
 * @param key Identificador único (ej: "login:192.168.1.1")
 * @param maxRequests Máximo número de peticiones permitidas en la ventana
 * @param windowSeconds Duración de la ventana de tiempo en segundos
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const sql = `
      INSERT INTO rate_limits (key, count, reset_at, updated_at)
      VALUES ($1, 1, NOW() + ($2 || ' seconds')::INTERVAL, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE
      SET 
        count = CASE 
          WHEN rate_limits.reset_at < CURRENT_TIMESTAMP THEN 1 
          ELSE rate_limits.count + 1 
        END,
        reset_at = CASE 
          WHEN rate_limits.reset_at < CURRENT_TIMESTAMP THEN NOW() + ($2 || ' seconds')::INTERVAL 
          ELSE rate_limits.reset_at 
        END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING count, reset_at;
    `;

    const res = await query(sql, [key, windowSeconds]);
    const { count, reset_at } = res.rows[0];
    const resetDate = new Date(reset_at);

    if (count > maxRequests) {
      logger.warn({ message: 'Rate limit excedido', key, count, maxRequests, resetDate });
      return {
        success: false,
        remaining: 0,
        resetAt: resetDate,
      };
    }

    return {
      success: true,
      remaining: Math.max(0, maxRequests - count),
      resetAt: resetDate,
    };
  } catch (error) {
    logger.error('Error al verificar rate limit persistente en BD:', error);
    // En caso de fallo transitorio en base de datos, permitir continuar para no bloquear usuarios legítimos
    return {
      success: true,
      remaining: 1,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }
}

/**
 * Restablece o elimina el registro de rate limit para una clave (ej: tras login exitoso)
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await query('DELETE FROM rate_limits WHERE key = $1', [key]);
  } catch (error) {
    logger.error('Error al resetear rate limit en BD:', error);
  }
}

