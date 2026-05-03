# Research: Veloce Car Marketplace

**Branch**: `001-veloce-marketplace` | **Date**: 2026-05-03

## 1. VIN Decoding API

**Decision**: Auto.dev (primary) + NHTSA vPIC (fallback)

**Rationale**: Auto.dev provides global VIN coverage (US, EU, Asia-Pacific) at 1,000 free calls/month, then $0.004/call — critical for Egyptian market with imports from all regions. NHTSA vPIC is free and covers US-market vehicles as a no-cost fallback layer.

**Alternatives considered**:
- Vincario — strong EU coverage but ~$0.10+/call, too expensive for startup
- Vehicle Databases — US/Canada focused, no meaningful free tier
- CARSXE — smaller provider, less proven reliability

## 2. Real-Time Messaging

**Decision**: Socket.IO (python-socketio + socket.io-client)

**Rationale**: Auto-reconnection with exponential backoff, connection state recovery (v4), and WebSocket-to-HTTP-long-polling fallback are essential for flaky Egyptian mobile connections. Binary framing avoids base64 inflation on images/voice notes. Native FastAPI WebSocket would require building all reconnection logic manually. SSE is unidirectional and lacks binary support.

**Alternatives considered**:
- FastAPI native WebSocket — stable integration but no built-in reconnection/state-recovery
- SSE + REST — unidirectional, no binary framing, dual-protocol coordination adds fragility

**Integration note**: Mount via `socketio.ASGIApp` on a separate path from FastAPI routes to avoid documented connection-drop issues under load.

## 3. PWA Offline Patterns

**Decision**: Dexie.js + vite-plugin-pwa (Workbox) + BackgroundSync

**Rationale**:
- **IndexedDB**: Dexie.js v4+ provides ORM-like API with `useLiveQuery` React hook for reactive UI updates on favorited listings. Indexed queries support filtered searches offline.
- **Caching strategy per asset**: Cache-first for app shell/photos, stale-while-revalidate for API responses, network-only + BackgroundSync for mutations.
- **Background Sync**: Workbox `BackgroundSyncPlugin` queues failed POST/PUT in IndexedDB and replays on reconnect. Fallback: `online` event listener + IndexedDB outbox for browsers without `sync` event support.

**Alternatives considered**:
- `idb` — no React hooks, more boilerplate
- `localForage` — key-value only, no indexed queries
- Custom sync queue — fragile, no service worker guarantee

## 4. Social Authentication

**Decision**: Authlib + PyJWT

**Rationale**: Authlib provides first-class FastAPI integration with native async, built-in CSRF/state handling, and OIDC discovery for Google. Facebook configured manually. PyJWT issues custom JWTs after social login — stored as httpOnly cookies for CSRF safety. Backend handles OAuth redirect flow: `/auth/login/{provider}` → provider → `/auth/callback/{provider}` → upsert user → issue JWT → redirect to SPA.

**Alternatives considered**:
- fastapi-sso — simpler but less flexible, smaller community
- fastapi-users — overly opinionated, too heavy for this use case
- python-social-auth — stagnant, Django-centric
- Custom OAuth2 — reinventing the wheel; Authlib handles token exchange correctly

## 5. File Storage

**Decision**: Local filesystem storage

**Rationale**: Simplest approach aligned with SQLite philosophy. Photos, voice notes, and verification documents are saved to a `storage/` directory on the server and served as static files via FastAPI's `StaticFiles` mount. No external service dependencies, no API keys, no cost. Image optimization (resize, WebP conversion) handled server-side via Pillow before writing to disk. Future migration to Supabase/S3 possible if scale demands it.

**Alternatives considered**:
- Supabase Storage — adds external dependency and cost; unnecessary for single-server MVP
- AWS S3 + CloudFront — over-engineered for early stage
- Cloudinary — image-first, voice notes/PDFs are second-class, pricing escalates
- MinIO — own ops/backups/CDN, unjustified at this stage