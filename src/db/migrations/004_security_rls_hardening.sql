-- Migración 004: Blindaje de Seguridad y Row Level Security (RLS)
-- Cierra la brecha de exposición pública de datos a través de Supabase PostgREST (anon / public)

-- 1. Habilitar y blindar RLS en la tabla sensible 'users'
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Denegar acceso indiscriminado a usuarios ajenos.
-- Solo permite acceso a usuarios que consulten su propio registro o administradores.
DROP POLICY IF EXISTS users_isolation_policy ON users;
CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (
        id = nullif(current_setting('app.current_user_id', true), '')::uuid
        OR 
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = nullif(current_setting('app.current_user_id', true), '')::uuid 
            AND u.role = 'admin'
        )
    );

-- 2. Habilitar RLS en 'web_settings'
ALTER TABLE web_settings ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de configuraciones del sitio
DROP POLICY IF EXISTS web_settings_public_read ON web_settings;
CREATE POLICY web_settings_public_read ON web_settings
    FOR SELECT
    USING (true);

-- Solo administradores pueden modificar la configuración web
DROP POLICY IF EXISTS web_settings_admin_write ON web_settings;
CREATE POLICY web_settings_admin_write ON web_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = nullif(current_setting('app.current_user_id', true), '')::uuid 
            AND u.role = 'admin'
        )
    );

-- 3. Habilitar RLS en 'success_cases'
ALTER TABLE success_cases ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública únicamente de testimonios activos
DROP POLICY IF EXISTS success_cases_public_read ON success_cases;
CREATE POLICY success_cases_public_read ON success_cases
    FOR SELECT
    USING (is_active = true);

-- Solo administradores pueden crear, modificar o eliminar casos de éxito
DROP POLICY IF EXISTS success_cases_admin_write ON success_cases;
CREATE POLICY success_cases_admin_write ON success_cases
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = nullif(current_setting('app.current_user_id', true), '')::uuid 
            AND u.role = 'admin'
        )
    );

-- 4. Habilitar RLS en 'plans'
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de planes activos
DROP POLICY IF EXISTS plans_public_read ON plans;
CREATE POLICY plans_public_read ON plans
    FOR SELECT
    USING (is_active = true);

-- Solo administradores pueden crear, actualizar o eliminar planes
DROP POLICY IF EXISTS plans_admin_write ON plans;
CREATE POLICY plans_admin_write ON plans
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = nullif(current_setting('app.current_user_id', true), '')::uuid 
            AND u.role = 'admin'
        )
    );
