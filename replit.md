# Workspace
    - Hii I'm Devvrat
## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## AI Money Blog (artifact)
- Path: `/`, Vite + React + Wouter + TanStack Query + react-markdown.
- Backend: `artifacts/api-server` (Express, Drizzle, Postgres) mounted at `/api`.
- AI features (TL;DR summary, chatbot) use OpenAI via Replit AI Integration (gpt-5.2).
- Seed: `cd artifacts/api-server && npx esbuild src/seed.ts --bundle --platform=node --format=esm --outfile=dist/seed.mjs --external:pg-native --external:pino --external:pino-pretty --external:thread-stream --banner:js="import {createRequire as __cr} from 'node:module'; globalThis.require=__cr(import.meta.url);" && node dist/seed.mjs`
