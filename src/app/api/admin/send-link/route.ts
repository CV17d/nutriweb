import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendSubscriptionLinkEmail } from '../../../../services/email';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';
import { withErrorHandler } from '../../../../lib/api-handler';
import { logger } from '../../../../lib/logger';

const sendLinkSchema = z.object({
  user_id: z.string().uuid('ID de usuario inválido'),
  subscription_id: z.string().uuid('ID de suscripción inválido'),
});

async function postHandler(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { 
        error: 'Unauthorized', 
        message: 'Tu sesión ha caducado por inactividad. Por favor, vuelve a iniciar sesión.' 
      }, 
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = sendLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros inválidos', details: parsed.error.format() }, { status: 400 });
  }

  const { user_id, subscription_id } = parsed.data;

  // Extraer el host/origin dinámico de la petición para que el enlace del correo use la URL pública si existe
  const originHeader = request.headers.get('origin');
  const hostHeader = request.headers.get('host');
  const protoHeader = request.headers.get('x-forwarded-proto') || 'http';
  let baseUrl: string | undefined = undefined;
  if (originHeader) {
    baseUrl = originHeader;
  } else if (hostHeader) {
    baseUrl = `${protoHeader}://${hostHeader}`;
  }

  let userResult;
  try {
    userResult = await query(
      'SELECT u.full_name as name, u.email, p.name as plan_name, cs.sessions_used, cs.total_sessions FROM users u JOIN client_subscriptions cs ON u.id = cs.client_id JOIN plans p ON cs.plan_id = p.id WHERE u.id = $1 AND cs.id = $2',
      [user_id, subscription_id]
    );
  } catch (dbError: any) {
    logger.error('Error al consultar base de datos en send-link:', dbError);
    const isNetworkErr = dbError.code === 'ETIMEDOUT' || dbError.code === 'ECONNREFUSED' || dbError.message?.includes('timeout');
    return NextResponse.json(
      { 
        error: 'Error de base de datos',
        message: isNetworkErr
          ? 'No se pudo conectar con la base de datos de Supabase. Si estás en una red Wi-Fi ajena (café, trabajo, hotel), es probable que el cortafuegos de esa red bloquee el puerto de conexión (6543/5432).'
          : 'Error interno al consultar los datos del paciente.'
      },
      { status: 503 }
    );
  }

  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: 'Usuario o suscripción no encontrados' }, { status: 404 });
  }

  try {
    await sendSubscriptionLinkEmail(
      user.email,
      user.name,
      subscription_id,
      user.plan_name,
      user.sessions_used,
      user.total_sessions,
      baseUrl
    );
  } catch (emailError: any) {
    logger.error('Error enviando correo en send-link:', emailError);
    return NextResponse.json(
      { 
        error: 'Error al enviar correo', 
        message: emailError.message || 'El servicio de correos Resend rechazó el envío. Verifica tu conexión a internet.' 
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ 
    success: true, 
    message: `Enlace enviado con éxito a ${user.email}` 
  });
}

export const POST = withErrorHandler(postHandler);
