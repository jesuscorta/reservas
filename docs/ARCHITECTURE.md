# Arquitectura

## Stack

Next.js App Router, TypeScript estricto, React, Tailwind CSS, shadcn/ui, Lucide, React Hook Form, Zod, Drizzle ORM y Neon PostgreSQL. Recharts se reserva para estadísticas y `qrcode` genera QR descargables. Next.js aloja UI y backend sin servicios propios separados.

## Capas

- `app/`: rutas, layouts, Server Components y Route Handlers.
- `components/`: componentes visuales reutilizables.
- `features/`: UI y formularios de cada área.
- `lib/`: autenticación, fechas, validación y dominio de reservas.
- `db/`: cliente Drizzle, esquema, migraciones y seed.

Las páginas leen en servidor. Las mutaciones usan Server Actions y la lógica crítica centralizada (`createBooking`, `moveBooking`, `cancelBooking`, `restoreBooking`, `createRecurringBooking`, disponibilidad y validación). No se delega autorización ni disponibilidad al navegador.

## Autenticación

El código de club y contraseña de superadmin se almacenan con hash scrypt. Un token aleatorio se guarda hasheado en sesión y se entrega mediante cookie HttpOnly, `SameSite=Lax`, `Secure` en producción y expiración de 30 días. La impersonación es una cookie de sesión superadmin con club objetivo, rotulada de forma persistente en UI. Los secretos son variables de entorno.

## Seguridad

Zod valida entradas; Drizzle parametriza SQL. Los Route Handlers/Actions comprueban sesión, club activo y pertenencia de cada recurso. Los accesos llevan un rate limit sencillo en memoria para despliegues de instancia única; en producción puede sustituirse por almacenamiento compartido sin cambiar la interfaz. `DATABASE_URL` nunca se expone al cliente.

## PWA y despliegue

Manifest, metadatos Apple, iconos y service worker de caché de recursos estáticos permiten instalación. La app se despliega en Vercel con Neon mediante `DATABASE_URL`; `NEXT_PUBLIC_APP_URL` construye QR y URLs canónicas.

## Decisiones de MVP

No se añade una librería de auth ni backend independiente. La exclusión PostgreSQL es la fuente de verdad contra carreras. Se usa una representación temporal con timezone para seguridad en cambios de hora europeos.
