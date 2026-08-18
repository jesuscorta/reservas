# Reservas

Aplicación interna multi-tenant para gestionar las pistas de un club de pádel.

## Desarrollo

1. Copia `.env.example` a `.env.local` y configura una base Neon PostgreSQL.
2. Ejecuta la migración `src/db/migrations/0000_initial.sql` contra esa base (en Neon SQL Editor o con `psql`).
3. Instala dependencias con `npm install`.
4. Inicia el proyecto con `npm run dev`.
5. Ejecuta `npm run db:seed` para crear el superadmin y, después, crea el primer club desde `/superadmin`.

## Comandos

- `npm run lint`: lint.
- `npm run typecheck`: comprobación TypeScript.
- `npm test`: pruebas de dominio.
- `npm run build`: build de producción.
- `npm run db:generate`: genera migraciones Drizzle tras cambios de esquema.
- `npm run db:clean-demo`: elimina únicamente los clubes demo heredados `demo-padel` y `padel-sierra`.

## Despliegue

En Vercel, añade las variables de `.env.example`, incluyendo `DATABASE_URL` de Neon y `NEXT_PUBLIC_APP_URL` con el dominio final. Aplica migraciones antes de servir una versión que dependa de ellas.

La documentación de producto, UX, arquitectura, modelo y fases está en `docs/` y es la fuente de verdad del proyecto.
