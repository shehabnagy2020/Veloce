# Tasks: Veloce Car Marketplace

**Input**: Design documents from `/specs/001-veloce-marketplace/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Backend unit tests included as requested by user. Tests follow service-first pattern.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/`
- Backend source: `backend/app/`
- Frontend source: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend project structure: backend/app/, backend/storage/, backend/migrations/, backend/tests/ per plan.md
- [x] T002 Initialize Python project with FastAPI, SQLAlchemy, Alembic, Authlib, PyJWT, Socket.IO, Pillow, httpx, pytest in backend/pyproject.toml
- [x] T003 [P] Create frontend project with Vite + React + TypeScript: initialize frontend/ with Mantine UI, Zustand, TanStack Query, i18next, vite-plugin-pwa, framer-motion in frontend/package.json
- [x] T004 [P] Configure backend .env.example with DATABASE_URL, STORAGE_PATH, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, JWT_SECRET, AUTO_DEV_API_KEY in backend/.env.example
- [x] T005 [P] Configure frontend .env.example with VITE_API_URL, VITE_SOCKET_URL in frontend/.env.example
- [x] T006 [P] Create Mantine theme with true-black OLED colors (#0B0E14), RTL support, bilingual config in frontend/src/theme/index.ts
- [x] T007 [P] Setup i18next with Arabic and English translation files in frontend/src/i18n/ar.json and frontend/src/i18n/en.json
- [x] T008 [P] Setup Vitest + React Testing Library config in frontend/vite.config.ts
- [x] T009 [P] Create backend conftest.py with SQLite in-memory test database, async fixtures in backend/tests/conftest.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Create FastAPI app entry with CORS middleware, lifespan events, and static files mount for /storage in backend/app/main.py
- [x] T011 Create config module with Pydantic Settings loading from environment variables in backend/app/config.py
- [x] T012 Create database module with SQLAlchemy async engine, session factory, and base class in backend/app/database.py
- [x] T013 Create User ORM model with all fields from data-model.md (id, email, display_name, phone, auth_provider, provider_id, password_hash, language, role, etc.) in backend/app/models/user.py
- [x] T014 Create Listing ORM model with all fields and status enum (draft/published/sold/expired) in backend/app/models/listing.py
- [x] T015 [P] Create Photo ORM model in backend/app/models/photo.py
- [x] T016 [P] Create Favorite ORM model in backend/app/models/favorite.py
- [x] T017 [P] Create Conversation ORM model in backend/app/models/conversation.py
- [x] T018 [P] Create Message ORM model in backend/app/models/message.py
- [x] T019 [P] Create VerificationBadge ORM model in backend/app/models/badge.py
- [x] T020 Register all models in backend/app/models/__init__.py and create initial Alembic migration
- [x] T021 Create auth Pydantic schemas (RegisterRequest, LoginRequest, UserResponse, TokenResponse) in backend/app/schemas/auth.py
- [x] T022 [P] Create listing Pydantic schemas (ListingCreate, ListingUpdate, ListingResponse, ListingListResponse) in backend/app/schemas/listing.py
- [x] T023 [P] Create messaging Pydantic schemas (ConversationResponse, MessageCreate, MessageResponse) in backend/app/schemas/messaging.py
- [x] T024 [P] Create admin Pydantic schemas (BadgeReview, BadgeResponse) in backend/app/schemas/admin.py
- [x] T025 Implement Authlib OAuth2 registry with Google and Facebook providers in backend/app/services/auth_service.py
- [x] T026 Implement JWT token generation and verification with PyJWT in backend/app/services/auth_service.py
- [x] T027 Create auth API routes (POST /auth/register, POST /auth/login, GET /auth/login/{provider}, GET /auth/callback/{provider}, POST /auth/logout, GET /auth/me) in backend/app/api/auth.py
- [x] T028 Create get_current_user dependency that validates JWT and returns User in backend/app/api/deps.py
- [x] T029 Write unit tests for auth_service (JWT generation, verification, OAuth flow) in backend/tests/unit/test_auth_service.py
- [x] T030 Write API tests for auth endpoints (register, login, logout, me) in backend/tests/api/test_auth_api.py
- [x] T031 Implement local file storage service (save, delete, get_path for photos/voice_notes/documents) in backend/app/services/storage_service.py
- [x] T032 Write unit tests for storage_service in backend/tests/unit/test_storage_service.py
- [x] T033 Create React App shell with Mantine AppShell, router, and language-direction (RTL/LTR) provider in frontend/src/App.tsx
- [x] T034 Create API client service with authenticated fetch wrapper and base URL config in frontend/src/services/api.ts
- [x] T035 [P] Create auth Zustand store (user, token, login, logout, isAuthenticated) in frontend/src/store/auth.ts
- [x] T036 [P] Create auth components (LoginForm, SocialButtons, RegisterForm) with Mantine in frontend/src/components/auth/
- [x] T037 [P] Create auth pages and wire into router in frontend/src/pages/LoginPage.tsx and frontend/src/pages/RegisterPage.tsx

**Checkpoint**: Foundation ready — auth works, DB migrated, file storage operational, frontend shell with login

---

## Phase 3: User Story 1 - Search & Discover Cars (Priority: P1) — MVP

**Goal**: Buyers can search, filter, and browse car listings with price comparison indicators and shareable filtered URLs

**Independent Test**: Perform a filtered search, verify URL updates, confirm price comparison indicators on results

### Backend for User Story 1

- [x] T038 Implement price_service with market average calculation by make/model/year in backend/app/services/price_service.py
- [x] T039 Write unit tests for price_service (average calculation, indicator logic) in backend/tests/unit/test_price_service.py
- [x] T040 Implement listing_service with search, filter (make, model, price range, transmission, year, district), pagination, and sorting in backend/app/services/listing_service.py
- [x] T041 Write unit tests for listing_service (filter combinations, pagination, sort, only-published constraint) in backend/tests/unit/test_listing_service.py
- [x] T042 Create listings API routes (GET /listings with faceted filters, GET /listings/:id with price_indicator, PATCH /listings/:id for status transitions) in backend/app/api/listings.py
- [x] T043 Write API tests for listings endpoints (search, filter, detail, status transitions) in backend/tests/api/test_listings_api.py

### Frontend for User Story 1

- [x] T044 [P] [US1] Create search filter components (MakeSelect, ModelSelect, PriceRangeSlider, TransmissionSelect, YearSelect, DistrictSelect) with Mantine in frontend/src/components/search/
- [x] T045 [P] [US1] Create PriceIndicator component showing above/below/at average in frontend/src/components/search/PriceIndicator.tsx
- [x] T046 [US1] Create listing Zustand store with search params, results, and pagination in frontend/src/store/listing.ts
- [x] T047 [US1] Create useSearchParams hook to sync filter state with URL query parameters in frontend/src/hooks/useSearchParams.ts
- [x] T048 [US1] Create useGeolocation hook for browser Geolocation API with fallback to manual district selection in frontend/src/hooks/useGeolocation.ts
- [x] T049 [US1] Create SearchPage with filter sidebar, results grid, and URL-synced state in frontend/src/pages/SearchPage.tsx
- [x] T050 [US1] Create ListingDetailPage showing full listing info, photos, price indicator, and seller phone (if show_phone) in frontend/src/pages/ListingDetailPage.tsx

**Checkpoint**: Search & discovery fully functional — MVP demo-ready

---

## Phase 4: User Story 2 - Create a Car Listing (Priority: P1)

**Goal**: Sellers can create listings via VIN-first + card-based flow with Ghost Frame, live price comparison, and draft saving

**Independent Test**: Complete listing flow end-to-end: VIN auto-fill, price slider with market comparison, Ghost Frame photo capture, draft save/resume, publish

### Backend for User Story 2

- [x] T051 [US2] Implement vin_service with Auto.dev primary + NHTSA fallback VIN decoding in backend/app/services/vin_service.py
- [x] T052 [US2] Write unit tests for vin_service (valid VIN, invalid VIN, service fallback, timeout) in backend/tests/unit/test_vin_service.py
- [x] T053 [US2] Add VIN decode endpoint (POST /vin/decode) and listing photo upload endpoint (POST /listings/:id/photos) to backend/app/api/listings.py
- [x] T054 [US2] Update listing_service with draft save/resume, photo attachment, and publish logic in backend/app/services/listing_service.py
- [x] T055 [US2] Write API tests for listing creation (draft, photo upload, publish, VIN decode) in backend/tests/api/test_listings_api.py
- [x] T056 [US2] Write unit tests for updated listing_service (draft save, resume, photo attach, publish flow) in backend/tests/unit/test_listing_service.py

### Frontend for User Story 2

- [x] T057 [P] [US2] Create VINCard component with VIN input, auto-fill display, and manual-entry fallback in frontend/src/components/listing/VINCard.tsx
- [x] T058 [P] [US2] Create PriceCard component with Mantine RangeSlider and live market comparison indicator in frontend/src/components/listing/PriceCard.tsx
- [x] T059 [P] [US2] Create PhotoCard component with Ghost Frame camera overlay (front, side, interior) and client-side image compression via browser-image-compression in frontend/src/components/listing/PhotoCard.tsx
- [x] T060 [P] [US2] Create DetailsCard component with condition picker, district selector, and show_phone toggle in frontend/src/components/listing/DetailsCard.tsx
- [x] T061 [US2] Create ListingWizard orchestrator that manages card flow, draft save/resume, and publish in frontend/src/components/listing/ListingWizard.tsx
- [x] T062 [US2] Create image compression utility in frontend/src/utils/imageCompression.ts
- [x] T063 [US2] Create CreateListingPage wiring wizard into router in frontend/src/pages/CreateListingPage.tsx

**Checkpoint**: Sellers can create and publish listings via the VIN + Cards flow

---

## Phase 5: User Story 3 - Chat with Buyer/Seller (Priority: P2)

**Goal**: Buyers and sellers can exchange text, images, and voice notes in real time with privacy protection

**Independent Test**: Open conversation from a listing, send text, attach image, record and send voice note with waveform

### Backend for User Story 3

- [x] T064 [US3] Implement messaging_service with conversation creation, message persistence, and read status tracking in backend/app/services/messaging_service.py
- [x] T065 [US3] Write unit tests for messaging_service (conversation creation, duplicate check, message types, read status) in backend/tests/unit/test_messaging_service.py
- [x] T066 [US3] Create messaging REST API routes (GET /conversations, GET /conversations/:id, POST /conversations, POST /conversations/:id/messages with multipart for images/voice notes) in backend/app/api/messaging.py
- [x] T067 [US3] Implement Socket.IO event handlers (join_conversation, leave_conversation, send_message, typing) with room management in backend/app/websocket/chat.py
- [x] T068 [US3] Mount Socket.IO ASGI app on FastAPI in backend/app/main.py
- [x] T069 [US3] Write API tests for messaging endpoints (create conversation, send text/image/voice, list conversations) in backend/tests/api/test_messaging_api.py

### Frontend for User Story 3

- [x] T070 [P] [US3] Create Socket.IO client service with reconnection handling in frontend/src/services/socket.ts
- [x] T071 [P] [US3] Create VoiceRecorder component with MediaRecorder API, waveform visualization, and client-side audio compression in frontend/src/components/messaging/VoiceRecorder.tsx
- [x] T072 [P] [US3] Create WaveformDisplay component for playing received voice notes in frontend/src/components/messaging/WaveformDisplay.tsx
- [x] T073 [US3] Create ChatWindow component with message list, text input, image attach, and voice note recording in frontend/src/components/messaging/ChatWindow.tsx
- [x] T074 [US3] Create messaging Zustand store (conversations, active conversation, messages, unread counts) in frontend/src/store/messaging.ts
- [x] T075 [US3] Create MessagesPage with conversation list and chat panel in frontend/src/pages/MessagesPage.tsx

**Checkpoint**: Real-time messaging works with text, images, and voice notes

---

## Phase 6: User Story 7 - Trust Verification Badges (Priority: P2)

**Goal**: Admins can review and approve verification documents; approved badges display on listings

**Independent Test**: Seller submits documents, admin approves, badge appears on listing

### Backend for User Story 7

- [x] T076 [US7] Create admin API routes (GET /admin/badges, PATCH /admin/badges/:id, POST /admin/badges/:id/document) with admin-only guard in backend/app/api/admin.py
- [x] T077 [US7] Add badge submission and review logic to listing_service in backend/app/services/listing_service.py
- [x] T078 [US7] Write unit tests for badge review flow (submit, approve, reject, re-submit) in backend/tests/unit/test_listing_service.py
- [x] T079 [US7] Write API tests for admin badge endpoints in backend/tests/api/test_admin_api.py

### Frontend for User Story 7

- [x] T080 [P] [US7] Create VerificationBadge display component with tap-to-explain tooltip in frontend/src/components/badges/VerificationBadge.tsx
- [x] T081 [P] [US7] Create admin badge review table with approve/reject actions using Mantine DataGrid in frontend/src/components/badges/BadgeReviewTable.tsx
- [x] T082 [US7] Create AdminDashboard page with badge review interface in frontend/src/pages/AdminDashboard.tsx
- [x] T083 [US7] Integrate VerificationBadge into ListingDetailPage and search result cards in frontend/src/pages/ListingDetailPage.tsx and frontend/src/components/search/

**Checkpoint**: Trust verification badges fully operational

---

## Phase 7: User Story 4 - Lifestyle Matchmaker Quiz (Priority: P2)

**Goal**: Buyers can take a 3-step quiz and get curated car recommendations

**Independent Test**: Complete quiz, verify recommendations match budget/commute/family criteria

### Backend for User Story 4

- [x] T084 [US4] Implement quiz recommendation logic (filter published listings by budget_max, daily_commute_km, family_size) in backend/app/api/quiz.py
- [x] T085 [US4] Write unit tests for quiz recommendation logic in backend/tests/unit/test_listing_service.py

### Frontend for User Story 4

- [x] T086 [P] [US4] Create quiz step components (BudgetStep, CommuteStep, FamilyStep) with Mantine Slider and Select in frontend/src/components/quiz/
- [x] T087 [US4] Create QuizPage with step navigation and results display linking to listing details in frontend/src/pages/QuizPage.tsx

**Checkpoint**: Lifestyle quiz delivers relevant recommendations

---

## Phase 8: User Story 5 - Driveway Fit Overlay (Priority: P3)

**Goal**: Buyers can upload a parking photo and overlay a scaled 2D car silhouette

**Independent Test**: Upload parking photo from listing detail, verify car silhouette overlay appears at correct scale, test position adjustment

- [x] T088 [P] [US5] Create car silhouette data (approximate length/width per body_type as JSON) in frontend/src/utils/carDimensions.ts
- [x] T089 [US5] Create DrivewayFit component with HTML5 Canvas overlay, image upload, scale calculation, and drag-to-reposition in frontend/src/components/driveway/DrivewayFit.tsx
- [x] T090 [US5] Add "Driveway Fit" button and modal to ListingDetailPage in frontend/src/pages/ListingDetailPage.tsx

**Checkpoint**: Driveway Fit overlay works on any listing

---

## Phase 9: User Story 6 - Browse Favorites Offline (Priority: P3)

**Goal**: Buyers can save favorites and access them offline; queued messages send when connectivity returns

**Independent Test**: Save favorites online, go offline, verify favorites accessible, queue a message, reconnect and verify message sent

### Backend for User Story 6

- [x] T091 [US6] Add favorite toggle endpoint (POST /listings/:id/favorite) and favorites list endpoint (GET /listings/favorites) to backend/app/api/listings.py
- [x] T092 [US6] Write API tests for favorite endpoints in backend/tests/api/test_listings_api.py

### Frontend for User Story 6

- [x] T093 [P] [US6] Setup Dexie.js database with tables for favorites and syncQueue in frontend/src/services/db.ts
- [x] T094 [P] [US6] Setup vite-plugin-pwa with Workbox config (cache-first for photos/app shell, stale-while-revalidate for API, BackgroundSync for mutations) in frontend/vite.config.ts
- [x] T095 [P] [US6] Create PWA manifest with true-black theme, icons, and display: standalone in frontend/public/manifest.json
- [x] T096 [US6] Implement favorite sync: save to Dexie for offline + POST to API when online, with useLiveQuery reactive hook in frontend/src/hooks/useFavorites.ts
- [x] T097 [US6] Implement Background Sync queue for outgoing messages and listing submissions with online event fallback in frontend/src/services/syncQueue.ts
- [x] T098 [US6] Create GaragePage displaying offline favorites from Dexie in frontend/src/pages/GaragePage.tsx
- [x] T099 [US6] Add favorite button to ListingDetailPage and search result cards in frontend/src/pages/ListingDetailPage.tsx and frontend/src/components/search/

**Checkpoint**: Offline Garage mode and Background Sync fully operational

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T100 Implement listing expiry cron: auto-expire published listings after 30 days of inactivity (no views/messages) in backend/app/services/listing_service.py
- [x] T101 Add listing "Sold" marking: seller can mark listing as sold from their listings page in frontend/src/pages/MyListingsPage.tsx
- [x] T102 [P] Add listing view counter increment on GET /listings/:id in backend/app/api/listings.py
- [x] T103 [P] Add bilingual RTL/LTR layout switching to all pages based on user language preference in frontend/src/App.tsx
- [x] T104 [P] Add Framer Motion page transitions and micro-interactions in frontend/src/App.tsx
- [x] T105 [P] Verify all i18n keys are complete in both frontend/src/i18n/ar.json and frontend/src/i18n/en.json
- [x] T106 Run quickstart.md validation: both backend and frontend start, tests pass, auth flow works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 2 + Phase 3 (needs price_service and listing_service from US1)
- **US3 (Phase 5)**: Depends on Phase 2 (needs listing detail page from US1 for "message seller" button)
- **US7 (Phase 6)**: Depends on Phase 2 + Phase 3 (needs listing display from US1)
- **US4 (Phase 7)**: Depends on Phase 2 + Phase 3 (needs search/listing infrastructure from US1)
- **US5 (Phase 8)**: Depends on Phase 2 + Phase 3 (needs listing detail page from US1)
- **US6 (Phase 9)**: Depends on Phase 2 + Phase 3 (needs favorites API, listing detail from US1)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Depends on US1 (shares listing_service, price_service)
- **US3 (P2)**: Depends on US1 (conversation initiated from listing detail page)
- **US7 (P2)**: Depends on US1 (badges display on listing cards)
- **US4 (P2)**: Depends on US1 (quiz queries the same listings)
- **US5 (P3)**: Depends on US1 (overlay accessed from listing detail)
- **US6 (P3)**: Depends on US1 (favorites toggle on listings)

### Within Each User Story

- Unit tests before or alongside service implementation
- Models before services
- Services before API routes
- API routes before frontend components
- Core implementation before integration

### Parallel Opportunities

- All Phase 1 [P] tasks can run in parallel
- Within Phase 2: T015-T019 (ORM models) can run in parallel; T021-T024 (schemas) can run in parallel; T035-T037 (frontend auth) can run in parallel
- US3 and US7 can be worked on in parallel after US1 (different domains)
- US4 and US5 can be worked on in parallel after US1
- Within US2: T057-T060 (card components) can run in parallel
- Within US6: T093-T095 (Dexie, PWA config, manifest) can run in parallel

---

## Parallel Example: User Story 2

```bash
# Parallel card components (different files, no cross-dependencies):
Task: "Create VINCard component in frontend/src/components/listing/VINCard.tsx"
Task: "Create PriceCard component in frontend/src/components/listing/PriceCard.tsx"
Task: "Create PhotoCard component in frontend/src/components/listing/PhotoCard.tsx"
Task: "Create DetailsCard component in frontend/src/components/listing/DetailsCard.tsx"
```

## Parallel Example: User Story 1

```bash
# Parallel search components (different files):
Task: "Create search filter components in frontend/src/components/search/"
Task: "Create PriceIndicator component in frontend/src/components/search/PriceIndicator.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Search & Discover)
4. **STOP and VALIDATE**: Test search, filtering, price comparison, URL sharing
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Search works → Deploy/Demo (MVP!)
3. Add US2 → Listing creation works → Deploy/Demo
4. Add US3 → Messaging works → Deploy/Demo
5. Add US7 → Trust badges work → Deploy/Demo
6. Add US4 → Quiz works → Deploy/Demo
7. Add US5 → Driveway Fit works → Deploy/Demo
8. Add US6 → Offline/Garage works → Deploy/Demo
9. Polish → Production-ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Backend tests use pytest with in-memory SQLite
- Frontend tests use Vitest + React Testing Library
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently