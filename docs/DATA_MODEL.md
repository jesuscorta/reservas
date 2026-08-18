# Modelo de datos

## Tenancy e invariantes

Todas las entidades operativas llevan `club_id`. Toda lectura y escritura del servidor filtra por el club autorizado; los IDs del cliente nunca bastan. Una pista y una reserva deben pertenecer al mismo club. Los cambios críticos y su audit log se realizan en una transacción.

## Tablas

- `clubs`: identidad, slug único, hash del código y estado.
- `club_settings`: un registro por club con duración de slot, pago opcional y timezone IANA.
- `courts`: pista, orden y estado activo; no se borra si tiene histórico.
- `business_hours`: apertura, cierre o cierre por día de semana.
- `special_hours`: excepción única por club y fecha, con prioridad sobre el horario semanal.
- `bookings`: ocupación materializada, tipo, nombre, notas, intervalo, estado, pago y recurrencia opcional.
- `booking_recurrences`: regla semanal y metadatos de la serie.
- `audit_logs`: registro append-only de acciones y snapshots JSONB.
- `club_sessions` y `superadmins`: sesiones con token hash y cuentas del propietario.

## Tiempo y slots

`bookings` guarda `starts_at` y `ends_at` como `timestamptz`; el club interpreta fechas y horas en su timezone IANA. Esto permite comparaciones PostgreSQL correctas y estadísticas por intervalo. Las entradas de hora de horarios se guardan como `time`. El servidor convierte el slot local válido a instantes UTC. Los slots parten de apertura y solo existen cuando terminan antes o al cierre.

## Integridad de solapamientos

PostgreSQL usa `btree_gist` y una exclusion constraint sobre `(court_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)` condicionada a `status = 'active'`. Así, dos operaciones concurrentes no pueden crear ocupaciones activas solapadas. El dominio valida previamente para ofrecer mensajes claros y traduce la violación de constraint a un conflicto de disponibilidad. Una cancelada queda fuera de la constraint.

## Recurrencias

Una serie tiene una regla semanal y cada ocurrencia es una fila real de `bookings` enlazada mediante `recurrence_id`. Al crearla se materializan semanalmente hasta la fecha final, con límite de 104 ocurrencias para proteger el sistema. Los conflictos se omiten y se informan; las válidas se crean. Editar o cancelar “esta y las siguientes” termina la regla original y actualiza/cancela solo las ocurrencias futuras, conservando las anteriores.

## Estados y auditoría

Las reservas son `active` o `cancelled`; nunca se eliminan. Pago es `pending` o `paid` solo cuando el ajuste lo habilita. Cada creación, actualización, movimiento, cancelación, restauración, pago, recurrencia, pista o ajuste relevante escribe un evento con actor, entidad, antes, después y fecha.

## Recuperación

Neon proporciona backups/PITR según el plan contratado; las migraciones Drizzle hacen reproducible el esquema. Audit logs ayudan a investigar cambios, pero no sustituyen una copia o recuperación de base de datos.
