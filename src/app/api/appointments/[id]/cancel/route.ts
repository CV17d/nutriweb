import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/src/lib/auth';
import { cancelAppointment } from '@/src/services/appointments';
import { withErrorHandler } from '@/src/lib/api-handler';

async function cancelHandler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Verificar sesión administrativa
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sesión no autorizada o expirada' },
      { status: 401 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', message: 'Se requiere el ID de la cita' },
      { status: 400 }
    );
  }

  // Motivo opcional de cancelación
  let reason: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.reason && typeof body.reason === 'string') {
      reason = body.reason.trim();
    }
  } catch {
    // Peticiones sin body (ej. DELETE sin payload)
  }

  const result = await cancelAppointment(id, reason);

  return NextResponse.json({
    message: 'Cita cancelada correctamente en la base de datos y Google Calendar',
    ...result,
  });
}

export const POST = withErrorHandler(cancelHandler);
export const PATCH = withErrorHandler(cancelHandler);
export const DELETE = withErrorHandler(cancelHandler);
