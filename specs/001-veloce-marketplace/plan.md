# Implementation Plan: Veloce Car Marketplace

**Branch**: `001-veloce-marketplace` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-veloce-marketplace/spec.md`

## Summary

Veloce is a bilingual (Arabic/English) car marketplace PWA targeting the Egyptian market with a high-contrast OLED-optimized dark UI. Core features include faceted search with location-based filtering, a guided listing wizard with Ghost Frame photo capture and VIN decoding, an integrated real-time messenger with voice notes, a lifestyle matchmaker quiz, a 2D driveway-fit overlay, offline favorites via IndexedDB, trust verification badges, and seller-controlled phone number visibility. Built with React.js (frontend), FastAPI/Python (backend), and SQLite (storage).

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, React 18, Mantine UI, Socket.IO, SQLAlchemy, Zod, React Hook Form, browser-image-compression
**Storage**: SQLite (via SQLAlchemy/Alembic for migrations), IndexedDB (client-side offline cache), local filesystem (images/voice notes via `storage/` directory)
**Testing**: pytest + pytest-asyncio + httpx (backend unit/integration), Vitest + React Testing Library (frontend)
**Target Platform**: Web (PWA — mobile-first, desktop-supported)
**Project Type**: Web application (SPA + API)
**Performance Goals**: Search results < 10s, message delivery < 2s, PWA launch < 3s, image compression >= 60% reduction
**Constraints**: Offline-capable, OLED true-black (#0B0E14), bilingual AR/EN with RTL support, Egyptian EGP pricing, mobile-first
**Scale/Scope**: Egyptian market, ~15 screens, ~25 API endpoints, real-time messaging

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file contains template placeholders only — no concrete principles defined. Gate passes vacuously. Re-check after Phase 1 design once constitution is ratified.

## Project Structure

### Documentation (this feature)

```text
specs/001-veloce-marketplace/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py              # FastAPI app entry, CORS, lifespan
│   ├── config.py            # Settings (env vars, secrets)
│   ├── database.py          # SQLAlchemy engine/session setup
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── listing.py
│   │   ├── conversation.py
│   │   ├── message.py
│   │   └── badge.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── listing.py
│   │   ├── messaging.py
│   │   └── admin.py
│   ├── api/                 # API route modules
│   │   ├── auth.py          # Social login + email/password
│   │   ├── listings.py      # CRUD + search + filtering
│   │   ├── messaging.py     # REST endpoints for conversations
│   │   ├── admin.py         # Badge review, document management
│   │   └── quiz.py          # Lifestyle matchmaker logic
│   ├── services/            # Business logic layer
│   │   ├── auth_service.py
│   │   ├── listing_service.py
│   │   ├── messaging_service.py
│   │   ├── vin_service.py
│   │   ├── storage_service.py
│   │   └── price_service.py
│   └── websocket/           # Socket.IO event handlers
│       └── chat.py
├── storage/                 # Local file storage (photos, voice notes, docs)
│   ├── photos/
│   ├── voice_notes/
│   └── documents/
├── migrations/              # Alembic migration files
├── tests/
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_listing_service.py
│   │   ├── test_auth_service.py
│   │   ├── test_messaging_service.py
│   │   ├── test_vin_service.py
│   │   ├── test_storage_service.py
│   │   └── test_price_service.py
│   ├── api/
│   │   ├── test_listings_api.py
│   │   ├── test_auth_api.py
│   │   ├── test_messaging_api.py
│   │   └── test_admin_api.py
│   └── test_admin.py
├── alembic.ini
├── pyproject.toml
└── Dockerfile

frontend/
├── src/
│   ├── App.tsx
│   ├── i18n/                # Arabic/English translations
│   │   ├── ar.json
│   │   └── en.json
│   ├── components/
│   │   ├── layout/          # Mantine AppShell, Nav, Footer
│   │   ├── search/          # Filters, Results, PriceIndicator
│   │   ├── listing/         # Card-based listing creation flow
│   │   │   ├── VINCard.tsx         # Step 1: VIN entry + auto-fill
│   │   │   ├── PriceCard.tsx       # Step 2: Price slider + market comparison
│   │   │   ├── PhotoCard.tsx       # Step 3: Ghost Frame capture
│   │   │   ├── DetailsCard.tsx     # Step 4: Condition, district, show_phone
│   │   │   └── ListingWizard.tsx   # Orchestrates card flow + draft save
│   │   ├── messaging/       # ChatWindow, VoiceRecorder, Waveform
│   │   ├── quiz/            # LifestyleQuiz steps
│   │   ├── driveway/        # DrivewayFit overlay
│   │   ├── badges/          # VerificationBadge display
│   │   └── auth/            # LoginForm, SocialButtons
│   ├── theme/               # Mantine theme (true-black OLED, RTL, AR/EN)
│   ├── pages/
│   │   ├── SearchPage.tsx
│   │   ├── ListingDetailPage.tsx
│   │   ├── CreateListingPage.tsx
│   │   ├── MessagesPage.tsx
│   │   ├── QuizPage.tsx
│   │   ├── GaragePage.tsx   # Offline favorites
│   │   └── AdminDashboard.tsx
│   ├── hooks/                # Custom React hooks
│   ├── services/            # API client, Socket.IO client
│   ├── store/               # Zustand stores
│   ├── utils/                # Image compression, audio compression
│   └── workers/             # Service worker (Workbox)
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
├── tests/
│   ├── components/
│   └── hooks/
├── vite.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

**Structure Decision**: Option 2 (Web application) selected. Frontend (React/Vite) and backend (FastAPI) are separate projects with their own dependency management, build pipelines, and test suites. They communicate via REST + WebSocket APIs.

## Complexity Tracking

No constitution violations to justify.