-- Migración 007: Tabla para fotos del consultorio y carrusel
CREATE TABLE IF NOT EXISTS clinic_photos (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    caption VARCHAR(255) DEFAULT '',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar orden y filtrado
CREATE INDEX IF NOT EXISTS idx_clinic_photos_order ON clinic_photos(display_order ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_clinic_photos_active ON clinic_photos(is_active);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clinic_photos ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (cualquier usuario puede ver fotos activas)
DROP POLICY IF EXISTS clinic_photos_public_read ON clinic_photos;
CREATE POLICY clinic_photos_public_read ON clinic_photos
    FOR SELECT
    USING (is_active = true);

-- Política de escritura solo para administradores
DROP POLICY IF EXISTS clinic_photos_admin_write ON clinic_photos;
CREATE POLICY clinic_photos_admin_write ON clinic_photos
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = nullif(current_setting('app.current_user_id', true), '')::uuid 
            AND u.role = 'admin'
        )
    );

-- Semillas iniciales demostrativas si la tabla está vacía
INSERT INTO clinic_photos (image_url, caption, display_order)
SELECT 
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    'Área de consulta privada y planificación nutricional personalizada',
    1
WHERE NOT EXISTS (SELECT 1 FROM clinic_photos);

INSERT INTO clinic_photos (image_url, caption, display_order)
SELECT 
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    'Consultorio equipado para valoración antropométrica y bioimpedancia',
    2
WHERE (SELECT COUNT(*) FROM clinic_photos) = 1;

INSERT INTO clinic_photos (image_url, caption, display_order)
SELECT 
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
    'Ambiente confortable y moderno diseñado para tu bienestar',
    3
WHERE (SELECT COUNT(*) FROM clinic_photos) = 2;

INSERT INTO clinic_photos (image_url, caption, display_order)
SELECT 
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    'Equipos de alta precisión para el seguimiento de tu composición corporal',
    4
WHERE (SELECT COUNT(*) FROM clinic_photos) = 3;
