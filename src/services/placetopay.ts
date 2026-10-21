import crypto from 'crypto';
import { logger } from '../lib/logger';

export interface PlacetopayAuth {
  login: string;
  tranKey: string;
  nonce: string;
  seed: string;
}

export interface PaymentRequestData {
  reference: string;
  description: string;
  amount: number;
  returnUrl: string;
  cancelUrl?: string;
}

class PlacetopayService {
  private login: string;
  private secretKey: string;
  private url: string;

  constructor() {
    this.login = process.env.PLACETOPAY_LOGIN || '';
    this.secretKey = process.env.PLACETOPAY_SECRET_KEY || '';
    this.url = process.env.PLACETOPAY_URL || 'https://checkout-test.placetopay.com';
  }

  private generateAuth(): PlacetopayAuth {
    const nonce = crypto.randomBytes(16).toString('hex');
    const seed = new Date().toISOString();
    
    // Generar TranKey
    const tranKeyString = nonce + seed + this.secretKey;
    const hash = crypto.createHash('sha256').update(tranKeyString).digest('base64');
    const nonceBase64 = Buffer.from(nonce).toString('base64');

    return {
      login: this.login,
      tranKey: hash,
      nonce: nonceBase64,
      seed,
    };
  }

  async createPaymentRequest(data: PaymentRequestData) {
    if (!this.login || !this.secretKey) {
      throw new Error('Credenciales de Placetopay no configuradas');
    }

    const payload = {
      auth: this.generateAuth(),
      payment: {
        reference: data.reference,
        description: data.description,
        amount: {
          currency: 'USD',
          total: data.amount,
        },
      },
      expiration: new Date(new Date().getTime() + 30 * 60000).toISOString(), // Expira en 30 minutos
      returnUrl: data.returnUrl,
      cancelUrl: data.cancelUrl || data.returnUrl,
      ipAddress: '127.0.0.1',
      userAgent: 'AndresNutricionWeb/1.0',
    };

    try {
      const response = await fetch(`${this.url}/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (responseData?.status?.status !== 'OK') {
        const errMsg = responseData?.status?.message || 'Error al iniciar el pago';
        logger.error(`[Placetopay Error]: Error desde pasarela: ${errMsg}`);
        throw new Error(errMsg);
      }

      return responseData; // Retorna requestId y processUrl
    } catch (error: any) {
      logger.error('[Placetopay Error]: Fallo de conexión con Placetopay', error?.message || error);
      throw error;
    }
  }

  async getPaymentStatus(requestId: string | number) {
    const payload = {
      auth: this.generateAuth(),
    };

    try {
      const response = await fetch(`${this.url}/api/session/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      return responseData; // status object
    } catch (error: any) {
      logger.error('[Placetopay Error]: Fallo al obtener estado de Placetopay', error?.message || error);
      throw error;
    }
  }
}

export const placetopay = new PlacetopayService();
