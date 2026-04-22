# AI Money Blog

A full-stack blog & resources platform focused on AI tools and monetization. It ships with:

- A public site (React + Vite + Tailwind) with blog posts, categories, a resources directory, trending/featured sections, light & dark mode, view/like tracking, AI-generated TL;DR summaries, and an AI assistant chatbot.
- A REST API (Node + Express + Drizzle ORM + PostgreSQL).
- A password-protected admin panel for managing posts (drafts & published), categories, resources, and newsletter subscribers — including a live Markdown editor.

---

## Project layout

This is a [pnpm workspace](https://pnpm.io/workspaces) monorepo:

```
artifacts/
  ai-money-blog/       # React + Vite frontend
  api-server/          # Express API server
  mockup-sandbox/      # Internal component preview server (dev only)
lib/
  db/                  # Drizzle ORM schema + db client
  ...                  # Shared API types, clients, configs
```

Production runs only need **`artifacts/ai-money-blog`** (built to static files) and **`artifacts/api-server`** (Node process).

---

## Requirements

- Node.js 20 or newer
- pnpm 9+ (`npm install -g pnpm`)
- A PostgreSQL 14+ database (local Postgres, Neon, Supabase, RDS, etc.)

---

## Quick start (local development)

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env   # then edit DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET

# 3. Push the schema to your database
pnpm --filter @workspace/db run db:push

# 4. (Optional) Seed sample posts, categories, resources
pnpm --filter @workspace/api-server run seed

# 5. Start the API + web in two terminals
pnpm --filter @workspace/api-server run dev   # http://localhost:8080
pnpm --filter @workspace/ai-money-blog run dev # http://localhost:5173
```

Open the site at the URL printed by Vite, and the admin panel at `/admin/login`. Sign in with the `ADMIN_PASSWORD` you set in `.env`.

---

## Environment variables

| Name              | Required | Description                                                                  |
| ----------------- | -------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`    | yes      | PostgreSQL connection string (`postgres://user:pass@host:5432/dbname` or a Supabase pooler URL). |
| `ADMIN_PASSWORD`  | yes      | Password used to sign in to `/admin/login`. Also serves as the API token.    |
| `SESSION_SECRET`  | yes      | Random string used by the API for signing/session helpers.                   |
| `PORT`            | no       | API server port (default `8080`).                                            |
| `NODE_ENV`        | no       | `development` or `production`.                                               |

Generate strong values with `openssl rand -hex 32`.

Supabase works here as-is. If you're using the transaction pooler, a typical value looks like:

```bash
DATABASE_URL="postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

---

## Database

Schema lives in `lib/db/src/schema/*.ts`. The project uses **Drizzle ORM** with `drizzle-kit` for migrations.

```bash
# Push the current schema directly (good for dev / first deploy)
pnpm --filter @workspace/db run db:push

# Generate SQL migration files (recommended for production)
pnpm --filter @workspace/db run db:generate
pnpm --filter @workspace/db run db:migrate
```

### Seeding sample data

The seed script creates a starter set of categories, posts, and resources so you can verify everything works end-to-end:

```bash
pnpm --filter @workspace/api-server run seed
```

Re-running it is safe — it upserts by slug.

---

## Production builds

Both apps build into self-contained bundles:

```bash
# Static frontend → artifacts/ai-money-blog/dist
pnpm --filter @workspace/ai-money-blog run build

# API server bundle  → artifacts/api-server/dist/index.mjs
pnpm --filter @workspace/api-server run build
```

Run the API in production with:

```bash
NODE_ENV=production node artifacts/api-server/dist/index.mjs
```

The frontend talks to the API via the same origin, so put both behind a single reverse proxy (Nginx/Caddy/Cloudflare/etc.) and route:

- `/api/*` → API server (`localhost:8080`)
- everything else → the static `artifacts/ai-money-blog/dist` directory

---

## Deployment recipes

### Option 1 — Replit Deployment (easiest)

1. Import the repo into Replit.
2. Create a Postgres database (built-in or external) and set `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` as Secrets.
3. Click **Publish**. Replit will build all artifacts and serve them under a single `.replit.app` domain (or your custom domain).

### Option 2 — VPS (Ubuntu / Debian) with Nginx + PM2

```bash
# On the server
sudo apt update && sudo apt install -y nodejs npm nginx postgresql
sudo npm install -g pnpm pm2

git clone <your-repo> /var/www/ai-money-blog
cd /var/www/ai-money-blog
pnpm install --frozen-lockfile

# Create env file
sudo nano /var/www/ai-money-blog/.env   # DATABASE_URL=..., ADMIN_PASSWORD=..., SESSION_SECRET=...

# Build everything
pnpm --filter @workspace/db run db:push
pnpm --filter @workspace/ai-money-blog run build
pnpm --filter @workspace/api-server run build

# Start API with PM2
pm2 start artifacts/api-server/dist/index.mjs \
  --name ai-money-api \
  --update-env
pm2 save
pm2 startup systemd
```

Sample `/etc/nginx/sites-available/ai-money-blog`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/ai-money-blog/artifacts/ai-money-blog/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ai-money-blog /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com   # free TLS via Let's Encrypt
```

### Option 3 — Docker

A minimal `Dockerfile` (build it from the repo root):

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/ai-money-blog run build
RUN pnpm --filter @workspace/api-server run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/artifacts/api-server/dist ./api/dist
COPY --from=build /app/artifacts/ai-money-blog/dist ./web
EXPOSE 8080
CMD ["node", "api/dist/index.mjs"]
```

Run:

```bash
docker build -t ai-money-blog .
docker run -d -p 8080:8080 \
  -e DATABASE_URL=... \
  -e ADMIN_PASSWORD=... \
  -e SESSION_SECRET=... \
  ai-money-blog
```

Serve the static `web/` folder from your reverse proxy or a sidecar Nginx container.

### Option 4 — Platform hosts

Both halves of the app deploy cleanly to most managed Node hosts:

- **API:** Render, Railway, Fly.io, Heroku — point them at `artifacts/api-server` with build command `pnpm --filter @workspace/api-server run build` and start command `node dist/index.mjs`.
- **Frontend:** Vercel, Netlify, Cloudflare Pages — point them at `artifacts/ai-money-blog` with build `pnpm --filter @workspace/ai-money-blog run build` and output `dist/`.
- Set `VITE_API_URL` (if you split origins) or proxy `/api/*` to the API.

---

## Admin panel

- URL: `/admin/login`
- Password: value of `ADMIN_PASSWORD`
- Token storage: a token (the password) is kept in `localStorage` and sent on every admin request as `x-admin-token`.

What you can do from the admin:

- **Dashboard** — totals (posts, views, likes, categories, resources, subscribers) and recent posts.
- **Posts** — list with search + filter (all / published / draft), one-click publish ↔ draft toggle, edit, delete.
- **Editor** — Markdown editor with a live preview tab, cover image preview, draft/publish switch, featured/premium toggles, tags, author info, category / difficulty / income type.
- **Categories** — create, edit (name, slug, description, color, icon), delete (blocked if posts exist in the category).
- **Resources** — full CRUD for the tools directory.
- **Subscribers** — view all newsletter signups, search, and export to CSV.

---

## Useful scripts

| Command                                                            | What it does                              |
| ------------------------------------------------------------------ | ----------------------------------------- |
| `pnpm --filter @workspace/ai-money-blog run dev`                   | Frontend dev server                       |
| `pnpm --filter @workspace/api-server run dev`                      | API dev server (rebuilds + restarts)      |
| `pnpm --filter @workspace/db run db:push`                          | Push schema changes to the database       |
| `pnpm --filter @workspace/api-server run seed`                     | Seed sample categories/posts/resources    |
| `pnpm --filter @workspace/ai-money-blog run build`                 | Production build of the frontend          |
| `pnpm --filter @workspace/api-server run build`                    | Production build of the API               |

---

## License

MIT — use it for whatever you like.
