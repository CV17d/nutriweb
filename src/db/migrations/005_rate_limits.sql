-- Migración 005: Tabla para Rate Limiting Persistente Serverless
-- Permite control de velocidad atómico y persistente entre réplicas e instancias serverless

CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(255) PRIMARY KEY,
    count INT NOT NULL DEFAULT 1,
    reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- Habilitar RLS en la tabla de rate limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Ningún cliente anónimo o externo debe tener acceso a rate_limits vía PostgREST
DROP POLICY IF EXISTS rate_limits_isolation_policy ON rate_limits;
CREATE POLICY rate_limits_isolation_policy ON rate_limits
    FOR ALL
    USING (false);
