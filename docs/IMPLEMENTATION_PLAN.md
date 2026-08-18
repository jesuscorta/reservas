# Plan de implementación

## Fase 1: Fundación

1. Crear proyecto Next.js con TypeScript, Tailwind y dependencias obligatorias.
2. Definir variables de entorno, Drizzle, esquema, migraciones y seed con dos clubes.
3. Implementar utilidades de timezone, slots, sesiones y dominio transaccional.

## Fase 2: Acceso y operación diaria

1. Implementar acceso de club, superadmin e impersonación.
2. Construir layout responsive, navegación y página Hoy con disponibilidad, filtro y próximos huecos.
3. Añadir formularios, búsqueda y acciones de reserva con feedback.

## Fase 3: Administración

1. Añadir calendario diario, ajustes de pistas, horarios, excepciones y pago opcional.
2. Añadir área superadmin, creación/edición/activación de clubes y QR.
3. Implementar recurrencias y estadísticas de club aisladas.

## Fase 4: Calidad y entrega

1. Configurar PWA, README y `.env.example`.
2. Añadir tests de invariantes de dominio y multi-tenancy.
3. Ejecutar lint, typecheck, tests y build; corregir incidencias y revisar rutas y estados principales.

## Riesgos resueltos

- Solapamientos concurrentes: constraint de exclusión PostgreSQL más transacciones.
- Cambios de hora y horario local: instantes `timestamptz` interpretados en timezone del club.
- Recurrencias ilimitadas: materialización hasta fecha final con límite razonable y reporte parcial de conflictos.
- Cambios de configuración destructivos: nunca modifican ni eliminan reservas existentes.
