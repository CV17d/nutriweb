-- Migración 002: Esquema de Suscripciones y Paquetes

-- 1. Añadir total_sessions a la tabla de planes
ALTER TABLE plans ADD COLUMN IF NOT EXISTS total_sessions INT NOT NULL DEFAULT 1;

-- 2. Crear tabla de suscripciones activas del cliente
CREATE TABLE IF NOT EXISTS client_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES plans(id),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    total_sessions INT NOT NULL,
    sessions_remaining INT NOT NULL,
    sessions_used INT NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Añadir referencia de la suscripción a la tabla de citas (appointments)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES client_subscriptions(id);

-- 4. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON client_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON client_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_appointments_subscription ON appointments(subscription_id);

-- 5. Seguridad a Nivel de Filas (RLS) para client_subscriptions
ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_isolation_policy ON client_subscriptions
    FOR ALL
    USING (
        client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        OR 
        EXISTS (SELECT 1 FROM users WHERE id = nullif(current_setting('app.current_user_id', true), '')::uuid AND role = 'admin')
    );
