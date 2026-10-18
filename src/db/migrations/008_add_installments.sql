-- Migración 008: Soporte para Pagos a Cuotas (Diferidos)

-- 1. Añadir columna installments a la tabla de transacciones de pago (transactions)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS installments INT NOT NULL DEFAULT 1;

-- 2. Añadir columna installments a la tabla de suscripciones activas (client_subscriptions)
ALTER TABLE client_subscriptions 
ADD COLUMN IF NOT EXISTS installments INT NOT NULL DEFAULT 1;

-- 3. Documentación y comentarios en el diccionario de datos
COMMENT ON COLUMN transactions.installments IS 'Número de meses o cuotas diferidas de la transacción (1 = Pago de contado)';
COMMENT ON COLUMN client_subscriptions.installments IS 'Número de meses o cuotas en que se adquirió la suscripción (1 = Pago de contado)';
