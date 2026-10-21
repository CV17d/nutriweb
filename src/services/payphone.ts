import { logger } from '../lib/logger';

export interface PayphoneConfirmParams {
  id: number;
  clientTxId: string;
}

export interface PayphoneConfirmResponse {
  statusCode: number; // 3 = Aprobada, 2 = Cancelada
  transactionStatus: string; // "Approved" | "Canceled" | etc.
  clientTransactionId: string;
  authorizationCode?: string;
  transactionId?: number;
  amount?: number;
  email?: string;
  phoneNumber?: string;
  document?: string;
  cardBrand?: string;
  cardType?: string;
  deferred?: boolean;
  deferredCode?: string;
  deferredMessage?: string;
  message?: string | null;
  errorCode?: number;
}

class PayphoneService {
  private token: string;
  private confirmUrl: string;

  constructor() {
    this.token = process.env.PAYPHONE_TOKEN || '';
    this.confirmUrl = 'https://paymentbox.payphonetodoesposible.com/api/confirm';
  }

  /**
   * Confirma la transacción con la API de Payphone.
   * IMPORTANTE: Payphone exige que la confirmación se realice dentro de los 5 minutos
   * posteriores al pago, de lo contrario se aplica reverso automático.
   */
  async confirmPayment(id: number, clientTxId: string): Promise<PayphoneConfirmResponse> {
    if (!this.token) {
      throw new Error('PAYPHONE_TOKEN no está configurado en las variables de entorno.');
    }

    const payload: PayphoneConfirmParams = {
      id: Number(id),
      clientTxId,
    };

    logger.info({ message: 'Confirmando transacción con Payphone', payload });

    try {
      const response = await fetch(this.confirmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      logger.info({ 
        message: 'Respuesta de confirmación de Payphone recibida', 
        statusCode: data?.statusCode,
        transactionStatus: data?.transactionStatus,
        clientTransactionId: data?.clientTransactionId 
      });

      return data as PayphoneConfirmResponse;
    } catch (error: any) {
      logger.error('[Payphone Error]: Error al comunicarse con la API de Confirmación de Payphone', error?.message || error);
      throw error;
    }
  }
}

export const payphone = new PayphoneService();
