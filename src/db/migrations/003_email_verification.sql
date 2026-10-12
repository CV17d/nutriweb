-- 1. Permitir el estado 'unverified' en la tabla de appointments
-- En PostgreSQL para agregar un valor a un constraint CHECK existente,
-- primero debemos eliminar el viejo constraint y crear uno nuevo.

ALTER TABLE appointments DROP CONSTRAINT appointments_status_check;

ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
  CHECK (status IN ('scheduled', 'completed', 'cancelled', 'unverified'));

-- 2. Añadir la columna de token
ALTER TABLE appointments ADD COLUMN verification_token VARCHAR(255);
