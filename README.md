# Isoko Talents

A skills-to-income marketplace for urban youth in Rwanda. Three-tier app: React/Vite client, Node/Express API, PostgreSQL via Sequelize.

## Structure

- `client/` — React + TypeScript + Redux Toolkit frontend (Vite)
- `server/` — Node.js/Express REST API + Sequelize ORM
- `docker-compose.yml` — client, server, and Postgres services

## Docker (recommended)

Docker Compose wires all three services together. No `.env` files are required for a first run — defaults are set in `docker-compose.yml`. The API container runs migrations and seeds demo data on startup.

```bash
docker compose up --build
```

- Client: http://localhost:5173 (Vite proxies `/api` and `/uploads` to the server container)
- API: http://localhost:4000/api (health check at http://localhost:4000/health)
- Postgres: localhost:5433 (host port; containers use the internal `postgres:5432` service name)

Demo admin login after seed: `emmanuel@isoko.demo` / `password123`

Optional overrides: copy `.env.example` to `.env` at the repo root, or set env vars such as `JWT_SECRET` and `GOOGLE_CLIENT_ID` before `docker compose up`.

Reset the database and re-seed:

```bash
docker compose down -v
docker compose up --build
```

## Running without Docker

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env

# server
cd server && npm install && npm run migrate && npm run seed && npm run dev

# client (separate terminal)
cd client && npm install && npm run dev
```

## Database migrations

```bash
cd server
npm run migrate        # apply all pending migrations
npm run migrate:undo   # roll back the most recent migration
```
