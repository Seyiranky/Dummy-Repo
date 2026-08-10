# Isoko Talents

A skills-to-income marketplace for urban youth in Rwanda. Three-tier app: React/Vite client, Node/Express API, PostgreSQL via Sequelize.

## Structure

- `client/` — React + TypeScript + Redux Toolkit frontend (Vite)
- `server/` — Node.js/Express REST API + Sequelize ORM
- `docker-compose.yml` — client, server, and Postgres services

## Local development

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
docker compose up --build
```

- Client: http://localhost:5173
- API: http://localhost:4000/api (health check at `/health`)
- Postgres: localhost:5432

## Running without Docker

```bash
# server
cd server && npm install && npm run dev

# client
cd client && npm install && npm run dev
```
