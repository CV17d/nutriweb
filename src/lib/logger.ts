/**
 * Logger estructurado para auditoría y debug seguro.
 * En producción, esto puede conectarse a Datadog, AWS CloudWatch, o usar Pino/Winston.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  [key: string]: any;
}

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /cookie/i,
  /private_?key/i,
  /credential/i,
];

function sanitizePayload(value: any, depth = 0): any {
  if (depth > 5 || value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive && typeof val === 'string' && val.length > 0) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizePayload(val, depth + 1);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

class BaseLogger {
  private log(level: LogLevel, payload: LogPayload | string) {
    const timestamp = new Date().toISOString();
    let logEntry: any = {
      timestamp,
      level,
    };

    if (typeof payload === 'string') {
      logEntry.message = payload;
    } else {
      logEntry = { ...logEntry, ...sanitizePayload(payload) };
    }

    // Convertimos a JSON para estructuración
    const logString = JSON.stringify(logEntry);

    switch (level) {
      case 'info':
        console.info(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'error':
        console.error(logString);
        break;
      case 'debug':
        console.debug(logString);
        break;
    }
  }

  info(payload: LogPayload | string) {
    this.log('info', payload);
  }

  warn(payload: LogPayload | string) {
    this.log('warn', payload);
  }

  error(payload: LogPayload | string, error?: any) {
    const basePayload = typeof payload === 'string' ? { message: payload } : payload;
    let errorDetails: Record<string, any> = {};

    if (error) {
      if (error instanceof Error) {
        errorDetails = {
          errorName: error.name,
          errorMessage: error.message,
          ...(process.env.NODE_ENV !== 'production' ? { stack: error.stack } : {}),
        };
      } else if (typeof error === 'object') {
        errorDetails = {
          errorMessage: error.message || error.error || error.description || JSON.stringify(sanitizePayload(error)),
        };
      } else {
        errorDetails = {
          errorMessage: String(error),
        };
      }
    }

    this.log('error', { ...basePayload, ...errorDetails });
  }

  debug(payload: LogPayload | string) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', payload);
    }
  }
}

export const logger = new BaseLogger();
