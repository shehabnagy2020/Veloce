# Veloce Car Marketplace

Bilingual (Arabic/English) car marketplace PWA targeting the Egyptian market with a high-contrast OLED-optimized dark UI.

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite 8, Mantine UI v7, Zustand, React Query, React Hook Form, Zod, i18next, Framer Motion, Socket.IO Client, Dexie (IndexedDB)
- **Backend**: FastAPI + Python 3.11+, SQLAlchemy (async), Alembic, Socket.IO, SQLite
- **Dev Tools**: PM2, Vitest, pytest

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PM2 (`npm install -g pm2`)

### Install Dependencies

```bash
# Root (PM2)
npm install

# Frontend
cd frontend && npm install

# Backend
cd backend && pip install -e ".[dev]"
```

### Run in Development

```bash
# Start both frontend and backend via PM2
npm run dev

# Or run individually:
npm run dev:frontend   # Vite dev server on :5173
npm run dev:backend    # uvicorn on :8000
```

PM2 logs: `npm run logs` | Stop: `npm run stop`

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | API base URL (proxied in dev) |
| `VITE_SOCKET_URL` | `""` (same origin) | Socket.IO server URL |

Backend config is in `backend/app/config.py` and can be overridden via `.env`.

## Project Structure

```
frontend/
  src/
    App.tsx              # Root component, providers, routing
    main.tsx             # Entry point
    theme/               # Mantine theme (OLED dark, RTL)
    i18n/                # Arabic/English translations
    components/
      auth/              # Login, Register, SocialButtons
      search/            # SearchFilters, PriceIndicator
      listing/           # ListingWizard, VINCard, PriceCard, PhotoCard, DetailsCard
      messaging/         # ChatWindow, VoiceRecorder, WaveformDisplay
      quiz/              # BudgetStep, CommuteStep, FamilyStep
      badges/            # VerificationBadge, BadgeReviewTable
      driveway/          # DrivewayFit overlay
    pages/               # Route-level page components
    services/            # API client, Socket.IO, Dexie DB, sync queue
    store/               # Zustand stores (auth, listing, messaging)
    hooks/               # useFavorites, useGeolocation, useSearchParams
    utils/               # Image compression, car dimensions
  vite.config.ts
  tsconfig.json

backend/
  app/
    main.py              # FastAPI app, CORS, lifespan
    config.py            # Settings (env vars)
    database.py          # SQLAlchemy async setup
    models/              # ORM models (user, listing, conversation, message, badge, photo, favorite)
    schemas/             # Pydantic request/response schemas
    api/                 # Route modules (auth, listings, messaging, admin, quiz, vin)
    services/            # Business logic layer
    websocket/           # Socket.IO chat handlers
  storage/               # Local file storage (photos, voice_notes, documents)
  migrations/            # Alembic migrations
  tests/                 # pytest + httpx
```

## Key Features

- **Search & Filters**: Faceted search with location-based filtering (Egyptian districts)
- **Listing Wizard**: Guided 4-step flow with VIN decoding, Ghost Frame photo capture, price comparison
- **Real-time Messaging**: Socket.IO-powered chat with voice notes and image sharing
- **Lifestyle Matchmaker**: Quiz-based car recommendations
- **Driveway Fit**: 2D overlay to visualize car size in parking spaces
- **Offline Favorites**: IndexedDB-backed garage for offline access
- **Trust Badges**: Verification system with admin review
- **Bilingual**: Full Arabic/English with RTL support

## UI Theme

OLED true-black (`#0B0E14`) with high-contrast surfaces (`#12151C`, `#1A1F2B`) and blue accent (`#4DABF7`). Mobile-first responsive layout using Mantine's AppShell.

## Testing

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && pytest
```