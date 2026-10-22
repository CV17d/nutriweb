-- 010_add_google_event_id_and_cancelled_at.sql
-- Añadir identificador de Google Calendar y fecha de cancelación para trazabilidad y sincronización

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_appointments_google_event ON appointments(google_event_id);
