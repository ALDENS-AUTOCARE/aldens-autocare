# Aldens Autocare Monorepo

This repository uses a pnpm workspace layout.

## Structure

- apps/web: Frontend application
- apps/api: Backend API service
- packages/shared: Shared utilities/types
- docs: Project documentation

## Getting Started

1. Install dependencies: pnpm install
2. Copy environment variables from .env.example
3. Start API: pnpm dev:api
4. Start all workspaces: pnpm dev

## Windows Build Reliability

The web app uses separate Next.js output directories for development and production builds to avoid intermittent file-lock issues on Windows.

- Development output: `.next-dev`
- Production build output: `.next-build`

Web scripts already include this configuration:

- `pnpm --filter @aldens-autocare/web dev`
- `pnpm --filter @aldens-autocare/web build`
- `pnpm --filter @aldens-autocare/web start`

If TypeScript includes are ever reset, ensure these paths are present in `apps/web/tsconfig.json`:

- `.next-dev/types/**/*.ts`
- `.next-build/types/**/*.ts`

## Database Migrations

Migration files are in `apps/api/database/migrations`.

- `001_core_schema.up.sql`: creates all core tables.
- `001_core_schema.down.sql`: drops all core tables.
- `002_seed_core_data.up.sql`: inserts baseline plans and sample records.
- `002_seed_core_data.down.sql`: removes seeded sample records.

Runner commands:

1. `pnpm migrate:up` (apply all pending migrations)
2. `pnpm migrate:status` (show applied and pending migrations)
3. `pnpm migrate:down` (roll back last applied migration)
4. `pnpm migrate:down:all` (roll back all applied migrations)

Direct API app commands:

1. `pnpm --filter @aldens-autocare/api migrate:up`
2. `pnpm --filter @aldens-autocare/api migrate:status`
