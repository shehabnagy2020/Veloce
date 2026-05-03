<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/001-veloce-marketplace/plan.md
<!-- SPECKIT END -->

# Veloce — Development Guide

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Mantine UI v7, Zustand, React Query, React Hook Form + Zod, Socket.IO client, Dexie (IndexedDB), i18next, Framer Motion, PWA (Workbox)
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy (async), Alembic, Socket.IO, SQLite, JWT auth
- **Dev**: PM2 (ecosystem.config.cjs), Vitest, pytest

## Commands

```bash
# Development (both services)
npm run dev                  # PM2: frontend + backend

# Individual services
npm run dev:frontend         # Vite on :5173
npm run dev:backend          # uvicorn on :8000

# PM2 management
npm run logs                 # View logs
npm run stop                 # Stop all services

# Frontend
cd frontend && npm test      # Vitest
cd frontend && npm run build # Production build

# Backend
cd backend && pytest         # Run tests
cd backend && alembic upgrade head  # Run migrations
```

## Architecture

- Frontend Vite dev server proxies `/api` and `/socket.io` to backend at `:8000`
- Frontend API client uses relative paths (`/api/v1`) via the Vite proxy
- Socket.IO connects to the same origin (proxied in dev)
- Mantine v7 theme with OLED true-black palette (`#0B0E14`)
- Bilingual support: English (LTR) and Arabic (RTL)
- Offline-first: IndexedDB (Dexie) for favorites + sync queue

## Key Files

| Purpose | Path |
|---------|------|
| PM2 config | `ecosystem.config.cjs` |
| Vite config | `frontend/vite.config.ts` |
| Mantine theme | `frontend/src/theme/index.ts` |
| API client | `frontend/src/services/api.ts` |
| Socket client | `frontend/src/services/socket.ts` |
| Zustand stores | `frontend/src/store/*.ts` |
| i18n translations | `frontend/src/i18n/{en,ar}.json` |
| FastAPI entry | `backend/app/main.py` |
| DB config | `backend/app/config.py` |
| Migrations | `backend/migrations/` |