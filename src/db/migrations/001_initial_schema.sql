-- Habilitar extensión para UUIDs si es necesario
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios / Atletas y Administradores
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'client')),
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Planes Nutricionales (Catálogo público para lectura)
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_months INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Tabla de Citas (Agendamiento libre o vinculado a planes)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    is_free_consultation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Transacciones y Pagos
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT REFERENCES plans(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    gateway_payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Seguimiento Privado del Cliente (Protegida por Token)
CREATE TABLE client_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tracking_token VARCHAR(64) UNIQUE NOT NULL,
    metrics JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices estratégicos
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_transactions_client ON transactions(client_id);
CREATE INDEX idx_progress_token ON client_progress(tracking_token);
CREATE INDEX idx_progress_client ON client_progress(client_id);

-- Activar RLS en las tablas sensibles
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento
CREATE POLICY appointments_isolation_policy ON appointments
    FOR ALL
    USING (
        client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        OR 
        EXISTS (SELECT 1 FROM users WHERE id = nullif(current_setting('app.current_user_id', true), '')::uuid AND role = 'admin')
    );

CREATE POLICY transactions_isolation_policy ON transactions
    FOR ALL
    USING (
        client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        OR 
        EXISTS (SELECT 1 FROM users WHERE id = nullif(current_setting('app.current_user_id', true), '')::uuid AND role = 'admin')
    );

CREATE POLICY progress_isolation_policy ON client_progress
    FOR ALL
    USING (
        client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        OR 
        EXISTS (SELECT 1 FROM users WHERE id = nullif(current_setting('app.current_user_id', true), '')::uuid AND role = 'admin')
    );
