# Guía Operativa de Seguridad y Protocolo de Respaldos (DRP)

**Proyecto:** `andres-nutricion-web`  
**Base de Datos:** PostgreSQL en Supabase  
**Área:** Operaciones de Infraestructura, Seguridad y Continuidad del Negocio  

---

## 1. Arquitectura de Respaldos en Supabase

Supabase gestiona la persistencia de datos sobre instancias dedicadas de PostgreSQL. La estrategia de respaldo combina:
1. **Respaldos Automáticos Diarios (Daily Backups):**
   - Supabase realiza instantáneas físicas y volcados lógicos de la base de datos de manera automatizada.
   - Incluyen esquemas completos (`public`, tablas, secuencias, funciones y políticas de Row Level Security - RLS).
2. **Point-In-Time Recovery (PITR - Planes Pro/Enterprise):**
   - Si está activado, registra los logs de transacciones (*Write-Ahead Logs - WAL*) permitiendo restaurar la base de datos a cualquier minuto o segundo específico de los últimos 7 a 30 días.

---

## 2. Cómo Probar y Descargar Respaldos Manuales Antes de Mantenimientos

Antes de realizar cambios mayores en código, migraciones estructurales o actualizaciones de librerías, se recomienda generar un volcado manual independiente.

### Opción A: Mediante la CLI oficial de PostgreSQL (`pg_dump`)
Desde tu terminal local (usando la cadena de conexión directa `DATABASE_URL` de Supabase):

```bash
# Exportar esquema y datos de producción
pg_dump --clean --if-exists --no-owner --no-privileges \
  "postgres://postgres.[TU_PROYECTO]:[TU_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  > backup_andres_nutricion_$(date +%Y%m%d_%H%M%S).sql
```

### Opción B: Mediante Supabase CLI
```bash
# Si tienes vinculado el CLI con 'supabase link'
supabase db dump -f backup_manual.sql
```

---

## 3. Protocolo Paso a Paso: Restauración desde el Panel de Supabase

Sigue estos pasos exactos cuando necesites restaurar un estado previo de la base de datos:

### Paso 1: Acceso al Administrador de Base de Datos
1. Inicia sesión en [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto (`andres-nutricion-web` o el nombre configurado).
3. En la barra de navegación lateral izquierda, haz clic en el ícono de **Settings** (Engranaje) ⚙️.
4. En el menú de configuración, haz clic en **Database**.
5. Desplázate hacia abajo hasta la sección **Backups**.

---

### Paso 2: Selección del Tipo de Respaldo

#### Caso A: Restauración mediante Daily Backups (Respaldos Diarios)
1. En la pestaña **Scheduled Backups**, verás la lista cronológica de las últimas copias generadas automáticamente.
2. Identifica la fecha y hora previa al incidente o corrupción de datos.
3. Haz clic en el botón **Restore** (o **Download** si prefieres inspeccionarlo primero).
4. El sistema solicitará confirmación escribiendo el nombre de tu proyecto para evitar clics accidentales.

#### Caso B: Restauración mediante Point-In-Time Recovery (PITR)
1. Si cuentas con PITR activo, selecciona la pestaña **Point in Time**.
2. Selecciona la fecha y la hora exacta (por ejemplo, 10 minutos antes de la falla o ataque).
3. Haz clic en **Restore project**.

---

### Paso 3: Validación en un Entorno Aislado (Recomendado para Pruebas)
> [!IMPORTANT]
> **Regla de Oro en Producción:** Nunca restaures directamente sobre el entorno de producción sin antes haber validado el respaldo en una base de datos secundaria o branch de prueba.

1. **Crear Proyecto de Prueba / Staging:**
   - En el panel de Supabase, crea un proyecto temporal gratuito (ej. `andres-nutricion-test`).
2. **Restaurar el Archivo `.sql` en el Proyecto de Prueba:**
   ```bash
   psql "postgres://postgres.[PROYECTO_TEST]:[PASSWORD]@aws-0-...:6543/postgres" < backup_manual.sql
   ```
3. **Verificar que la información esté íntegra:**
   - Confirmar que los usuarios, transacciones y citas correspondan a las fechas esperadas.
   - Confirmar que la aplicación conectada a la base de pruebas inicie y funcione sin excepciones.

---

### Paso 4: Restauración en Producción (In-Place Restore)
Cuando confirmes la necesidad de restaurar en la base de datos activa:
1. **Activar Ventana de Mantenimiento:**
   - Si es posible, coloca una página estática de mantenimiento en Vercel/servidor web para evitar que nuevos usuarios intenten agendar o pagar mientras dura la restauración.
2. **Confirmar la Restauración en Supabase:**
   - Confirma el proceso de restauración en el panel.
   - El proceso tarda entre 2 a 10 minutos dependiendo del volumen de datos. Durante este tiempo, la conexión de PostgreSQL se reiniciará brevemente.
3. **Reanudación del Servicio:**
   - Una vez finalizada la restauración en el panel (estado *Healthy / Active*), las conexiones del pool de Next.js (`pg`) se reestablecerán automáticamente.

---

## 4. Lista de Verificación Post-Restauración (Sanity Checks)

Inmediatamente después de restaurar, ejecuta estas comprobaciones críticas en el **SQL Editor** de Supabase:

### 1. Verificar Tablas Críticas
```sql
-- Validar conteos básicos
SELECT 'users' AS tabla, count(*) FROM users
UNION ALL
SELECT 'plans', count(*) FROM plans
UNION ALL
SELECT 'appointments', count(*) FROM appointments
UNION ALL
SELECT 'transactions', count(*) FROM transactions
UNION ALL
SELECT 'client_subscriptions', count(*) FROM client_subscriptions
UNION ALL
SELECT 'rate_limits', count(*) FROM rate_limits
UNION ALL
SELECT 'security_audit_logs', count(*) FROM security_audit_logs;
```

### 2. Confirmar que Row Level Security (RLS) sigue Activado
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```
*Todas las tablas deben tener `rowsecurity = true`.*

### 3. Verificar Conectividad con la Web
1. Ingresa a la URL pública de la web.
2. Ingresa a `/admin/login` e inicia sesión con la contraseña maestra.
3. Verifica la visualización del panel `/admin/patients` y `/admin/plans`.

---

## 5. Calendario de Simulacros de Recuperación (DR Drills)

Para garantizar que el protocolo funcione en una emergencia real:
- **Frecuencia:** Ejecutar una prueba de restauración en un proyecto de prueba cada **3 meses**.
- **Auditoría de Acceso:** Mantener actualizado y con autenticación de dos factores (2FA) el acceso a la cuenta administradora de Supabase.
- **Responsable:** Administrador del Sistema / Oficial de Seguridad.
