/**
 * Logger estructurado para auditoría y debug seguro.
 * En producción, esto puede conectarse a Datadog, AWS CloudWatch, o usar Pino/Winston.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  [key: string]: any;
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
      logEntry = { ...logEntry, ...payload };
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
    if (error && error instanceof Error) {
      this.log('error', {
        ...(typeof payload === 'string' ? { message: payload } : payload),
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack, // En producción puedes ocultar esto si lo deseas
      });
    } else {
      this.log('error', payload);
    }
  }

  debug(payload: LogPayload | string) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', payload);
    }
  }
}

export const logger = new BaseLogger();
