# Quickstart: Veloce Car Marketplace

**Branch**: `001-veloce-marketplace` | **Date**: 2026-05-03

## Prerequisites

- Python 3.11+
- Node.js 18+
- SQLite 3
- Google OAuth client ID + secret
- Facebook App ID + secret

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Copy environment template
cp .env.example .env
# Edit .env with your values:
#   DATABASE_URL=sqlite:///./veloce.db
#   STORAGE_PATH=./storage
#   GOOGLE_CLIENT_ID=your-google-client-id
#   GOOGLE_CLIENT_SECRET=your-google-secret
#   FACEBOOK_CLIENT_ID=your-facebook-app-id
#   FACEBOOK_CLIENT_SECRET=your-facebook-secret
#   JWT_SECRET=your-jwt-secret
#   AUTO_DEV_API_KEY=your-auto-dev-key

# Run database migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000/api/v1`, docs at `http://localhost:8000/docs`.

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your values:
#   VITE_API_URL=http://localhost:8000/api/v1
#   VITE_SOCKET_URL=http://localhost:8000

# Start dev server
npm run dev
```

App available at `http://localhost:5173`.

## Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

## Key Dependencies

### Backend (pyproject.toml)
- fastapi, uvicorn — API framework
- sqlalchemy, alembic — ORM + migrations
- python-socketio — Real-time messaging
- authlib, pyjwt — OAuth2 + JWT
- pillow — Server-side image processing
- aiofiles — Async file I/O for local storage
- httpx — VIN API client
- pytest, pytest-asyncio, httpx — Unit & API testing
- faker — Test data generation

### Frontend (package.json)
- react, react-dom, react-router-dom — UI framework
- @mantine/core, @mantine/hooks, @mantine/form — Component library
- @mantine/notifications — Toast notifications
- @mantine/dates — Date pickers
- @emotion/react — Mantine styling engine
- socket.io-client — Real-time messaging
- zustand — Client state management
- @tanstack/react-query — Server state management
- dexie, dexie-react-hooks — IndexedDB offline storage
- react-hook-form, zod — Form handling + validation
- browser-image-compression — Client-side image optimization
- i18next, react-i18next — Arabic/English localization
- vite-plugin-pwa — Service worker + Workbox
- framer-motion — UI animations
- vitest, @testing-library/react — Testing