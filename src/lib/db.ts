import { Pool } from 'pg';

// Patrón Singleton para evitar que el hot-reload de Next.js en desarrollo
// sature el pool de conexiones de Supabase abriendo clientes duplicados.
const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Evita cuelgues indefinidos si Supabase tarda en responder
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

// Manejar errores en clientes inactivos para prevenir caídas silenciosas
pool.on('error', (err) => {
  console.error('Error inesperado en cliente inactivo de Postgres:', err);
});

/**
 * Función genérica para ejecutar queries
 */
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

