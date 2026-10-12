-- Migración 006: Resiliencia, Idempotencia y Registro de Auditoría de Seguridad (Fase 4)

-- 1. Actualizar restricción de estado en transactions para soportar 'processing'
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
    CHECK (status IN ('pending', 'processing', 'success', 'failed'));

-- 2. Limpiar identificadores repetidos generados por mocks antiguos para habilitar unicidad estricta
UPDATE transactions 
SET gateway_payment_id = 'mock-' || id 
WHERE gateway_payment_id = 'gateway-id-mock';

-- 3. Índice único para evitar procesar dos veces el mismo pago de Payphone en transacciones distintas
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_gateway_payment_id_unique 
    ON transactions (gateway_payment_id) 
    WHERE gateway_payment_id IS NOT NULL;

-- 4. Restricción de unicidad para evitar suscripciones duplicadas por la misma transacción
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_transaction_unique 
    ON client_subscriptions (transaction_id);

-- 5. Tabla de Auditoría de Eventos de Seguridad
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    ip VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Índices para auditoría y búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_audit_ip_event ON security_audit_logs(ip, event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON security_audit_logs(created_at);

-- 7. Activar RLS en la tabla de auditoría para blindar contra PostgREST
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS security_audit_logs_isolation_policy ON security_audit_logs;
CREATE POLICY security_audit_logs_isolation_policy ON security_audit_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = nullif(current_setting('app.current_user_id', true), '')::uuid 
            AND role = 'admin'
        )
    );
