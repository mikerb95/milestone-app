# Milestone

Metas con horizonte, hábitos con racha y un día claro. Implementación completa
de la maqueta `Milestone-design/Milestone.dc.html` como aplicación real.

## Stack

- **Next.js 16** (App Router, Turbopack, server actions)
- **Tailwind CSS v4** con tokens del diseño en `src/app/globals.css`
- **Turso** (libSQL) + **Drizzle ORM**
- **Auth.js v5** con credenciales y Google

## Puesta en marcha

```bash
npm install
cp .env.example .env    # rellena las credenciales
npm run db:migrate      # aplica el esquema en Turso
npm run dev
```

### Variables de entorno

| Variable | Para qué sirve |
| --- | --- |
| `TURSO_DATABASE_URL` | `turso db show <db> --url` |
| `TURSO_AUTH_TOKEN` | `turso db tokens create <db>` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | URL base; en Vercel se deduce sola |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Opcionales: sin ellas se oculta el botón de Google |

El *redirect URI* de Google es `{AUTH_URL}/api/auth/callback/google`.

## Cómo está organizado

```
src/
  actions/      server actions (metas, hábitos, tareas, ajustes, cuenta)
  app/
    (auth)/     bienvenida, acceso, registro, recuperación
    (app)/      shell con sesión: hoy, metas, hábitos, tareas, más, ajustes
    api/        Auth.js y exportación JSON
  components/   shell, tarjetas, hojas (formularios) y primitivas de UI
  db/           esquema Drizzle y cliente
  lib/          fechas, dominio, i18n, consultas y datos de ejemplo
```

Puntos que conviene conocer antes de tocar el código:

- **Fechas.** Todo lo que es "un día" se guarda como texto `YYYY-MM-DD`. El día
  actual lo resuelve el servidor con la zona horaria del usuario y su hora de
  corte (`resolveToday` en `src/lib/queries.ts`) y baja al cliente como prop,
  para que la hidratación no dependa del reloj del navegador.
- **Detalle de meta.** `/goals/[id]` es una ruta paralela (`@detail`), así que en
  escritorio el panel convive con la lista y en móvil la cubre por completo.
- **Idioma.** Dentro de la sesión manda la preferencia guardada en la base; las
  pantallas sin sesión leen la cookie `ms_locale`.
- **Demo.** "Explorar la demo" crea una cuenta desechable ya sembrada con el
  conjunto de ejemplo del diseño (`src/lib/sample-data.ts`).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run db:generate` | Genera la migración a partir del esquema |
| `npm run db:migrate` | Aplica las migraciones en Turso |
| `npm run db:studio` | Drizzle Studio |
