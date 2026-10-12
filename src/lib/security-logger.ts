import { query } from './db';
import { logger } from './logger';
import { sendSecurityAlertEmail } from '../services/email';

export interface SecurityEventParams {
  eventType: string;
  ip: string;
  path: string;
  details?: Record<string, any>;
  userAgent?: string;
}

/**
 * Registra eventos de seguridad en la tabla persistente security_audit_logs
 * y notifica al administrador en caso de bloqueos por ataques de fuerza bruta.
 */
export async function logSecurityEvent({
  eventType,
  ip,
  path,
  details,
  userAgent,
}: SecurityEventParams): Promise<void> {
  const timestamp = new Date();
  
  try {
    const insertQuery = `
      INSERT INTO security_audit_logs (event_type, ip, path, details, created_at)
      VALUES ($1, $2, $3, $4, $5);
    `;
    
    await query(insertQuery, [
      eventType,
      ip,
      path,
      details ? JSON.stringify({ ...details, userAgent }) : JSON.stringify({ userAgent }),
      timestamp,
    ]);

    logger.warn({
      message: 'Evento de seguridad registrado',
      eventType,
      ip,
      path,
      details,
    });

    // Enviar alerta por email cuando se sobrepasa el límite en el login
    if (eventType === 'LOGIN_RATE_LIMIT_EXCEEDED' || eventType === 'BRUTE_FORCE_BLOCKED') {
      await handleLoginSecurityAlert(ip, path, details, userAgent, timestamp);
    }
  } catch (error) {
    logger.error('Error al registrar evento en security_audit_logs', error);
  }
}

/**
 * Gestiona el envío de alertas de seguridad con control de frecuencia (antispam)
 */
async function handleLoginSecurityAlert(
  ip: string,
  path: string,
  details?: Record<string, any>,
  userAgent?: string,
  timestamp: Date = new Date()
) {
  try {
    // 1. Evitar flooding de correos: verificar si ya enviamos alerta para esta IP en los últimos 30 min
    const recentAlert = await query(
      `SELECT id FROM security_audit_logs 
       WHERE ip = $1 AND event_type = 'SECURITY_ALERT_EMAIL_SENT' 
       AND created_at > NOW() - INTERVAL '30 minutes' 
       LIMIT 1;`,
      [ip]
    );

    if (recentAlert.rows.length > 0) {
      logger.info({ message: 'Alerta por correo ya enviada recientemente para esta IP', ip });
      return;
    }

    // 2. Obtener el email principal del administrador
    let adminEmail: string = process.env.ADMIN_EMAIL || '';
    if (!adminEmail) {
      const adminUser = await query(`SELECT email FROM users WHERE role = 'admin' LIMIT 1;`);
      if (adminUser.rows.length > 0 && adminUser.rows[0].email) {
        adminEmail = adminUser.rows[0].email;
      } else {
        adminEmail = 'info@andresburbanonutricionista.com';
      }
    }

    // 3. Registrar el intento de notificación para throttling
    await query(
      `INSERT INTO security_audit_logs (event_type, ip, path, details, created_at)
       VALUES ('SECURITY_ALERT_EMAIL_SENT', $1, $2, $3, $4);`,
      [ip, path, JSON.stringify({ target: adminEmail }), timestamp]
    );

    // 4. Enviar el correo de alerta
    await sendSecurityAlertEmail(adminEmail, {
      ip,
      path,
      attempts: details?.attempts || 5,
      timestamp,
      userAgent,
    });

    logger.info({ message: 'Correo de alerta de seguridad enviado al administrador', adminEmail, ip });
  } catch (emailError) {
    logger.error('Error al procesar alerta de seguridad por correo', emailError);
  }
}
