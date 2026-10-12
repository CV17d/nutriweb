import { NextResponse } from 'next/server';
import { logger } from './logger';

type ApiHandler = (req: Request, ...args: any[]) => Promise<NextResponse> | NextResponse;

/**
 * Interceptor global de errores (HOC) para envolver las rutas de la API.
 * Captura excepciones, las registra de forma segura y devuelve una respuesta estándar limpia.
 */
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      // 1. Auditoría: Registramos el error real internamente
      logger.error({
        message: 'Error no controlado en Endpoint API',
        method: req.method,
        url: req.url,
      }, error);

      // 2. Seguridad: Devolvemos un mensaje limpio al cliente sin exponer internals
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ocurrió un error interno en el servidor.' 
        },
        { status: 500 }
      );
    }
  };
}
