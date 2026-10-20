-- Migración 009: Agregar columnas para fotos de antes y después en casos de éxito (testimonios)
ALTER TABLE success_cases 
ADD COLUMN IF NOT EXISTS before_image_url TEXT,
ADD COLUMN IF NOT EXISTS after_image_url TEXT;
