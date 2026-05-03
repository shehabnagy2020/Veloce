# API Contracts: Veloce Car Marketplace

**Branch**: `001-veloce-marketplace` | **Date**: 2026-05-03

Base URL: `/api/v1`

Authentication: `Authorization: Bearer <jwt>` (except login/register endpoints)

---

## Auth

### POST /auth/register
Register with email/password.

```
Request:
  email: string (required, valid email)
  password: string (required, min 8 chars)
  display_name: string (required)

Response 201:
  user: { id, email, display_name, language }
  access_token: string (JWT, httpOnly cookie)
```

### GET /auth/login/{provider}
Redirect to OAuth provider. Providers: `google`, `facebook`.

```
Response 302: Redirect to provider consent screen
```

### GET /auth/callback/{provider}
OAuth callback. Exchanges code, upserts user, issues JWT.

```
Response 302: Redirect to SPA with JWT in httpOnly cookie
```

### POST /auth/login
Email/password login.

```
Request:
  email: string
  password: string

Response 200:
  user: { id, email, display_name, language }
  access_token: string (JWT, httpOnly cookie)

Response 401: Invalid credentials
```

### POST /auth/logout

```
Response 200: Clears JWT cookie
```

### GET /auth/me

```
Response 200:
  id: uuid
  email: string
  display_name: string
  phone: string | null
  language: "en" | "ar"
  role: "user" | "admin"

Response 401: Not authenticated
```

---

## Listings

### GET /listings
Search with faceted filters.

```
Query params:
  make?: string
  model?: string
  year_min?: int
  year_max?: int
  price_min?: int (EGP)
  price_max?: int (EGP)
  transmission?: "automatic" | "manual"
  district?: string
  lat?: float (requires lng + radius)
  lng?: float
  radius?: int (km, default 50)
  page?: int (default 1)
  limit?: int (default 20, max 50)
  sort?: "price_asc" | "price_desc" | "newest"

Response 200:
  items: [{ id, make, model, year, price, transmission, district, thumbnail_url, price_indicator, badges[], created_at }]
  total: int
  page: int
  limit: int

Note: Only returns status=published listings. price_indicator: "below_average" | "at_average" | "above_average" | null
```

### GET /listings/:id

```
Response 200:
  id, seller_id, seller_name, seller_phone (if show_phone=true), make, model, year,
  price, price_indicator, transmission, mileage, condition, body_type, engine_size,
  fuel_type, color, vin, description, district, lat, lng, show_phone, status,
  photos: [{ id, url, photo_type, position }],
  badges: [{ badge_type, status }],
  views_count, created_at

Response 404: Listing not found
```

### POST /listings
Create a new listing (authenticated).

```
Request:
  make: string
  model: string
  year: int
  price: int
  transmission: "automatic" | "manual"
  mileage?: int
  condition: "new" | "used" | "used_like_new"
  body_type?: string
  engine_size?: string
  fuel_type?: "petrol" | "diesel" | "hybrid" | "electric"
  color?: string
  vin?: string
  description?: string
  district: string
  lat?: float
  lng?: float
  show_phone: boolean (default false)

Response 201:
  id, status: "draft", ...

Response 400: Validation error
Response 401: Not authenticated
```

### PATCH /listings/:id
Update a listing (owner only).

```
Request: partial listing fields + status transition
  status?: "draft" | "published" | "sold"  (expired→published allowed for re-publish)

Response 200: Updated listing
Response 403: Not owner
Response 409: Invalid status transition
```

### DELETE /listings/:id
Soft-delete a listing (owner only).

```
Response 204
Response 403: Not owner
```

### POST /listings/:id/photos
Upload photos for a listing (owner only, multipart/form-data).

```
Request:
  file: binary (required)
  photo_type: "front" | "side" | "interior" | "other" (required)
  position: int (required)

Response 201:
  id, url, thumbnail_url, photo_type, position

Response 413: File too large
```

### POST /listings/:id/favorite
Toggle favorite on a listing (authenticated).

```
Response 200:
  favorited: boolean

Response 401: Not authenticated
```

### GET /listings/favorites
Get user's favorited listings (authenticated).

```
Query params: page?, limit?

Response 200:
  items: [{ listing details }]
  total: int
```

---

## VIN Decode

### POST /vin/decode
Decode a VIN to vehicle specs.

```
Request:
  vin: string (17 chars)

Response 200:
  make: string
  model: string
  year: int
  engine_size: string
  transmission: string
  body_type: string
  fuel_type: string

Response 400: Invalid VIN format
Response 404: VIN not found in decoder database
```

---

## Messaging

### GET /conversations
List user's conversations (authenticated).

```
Query params: page?, limit?

Response 200:
  items: [{ id, listing_id, listing_title, other_user_name, last_message, unread_count, updated_at }]
```

### GET /conversations/:id
Get conversation messages (participant only).

```
Query params: page?, limit?, before? (cursor)

Response 200:
  conversation: { id, listing_id, buyer_id, seller_id }
  messages: [{ id, sender_id, content_type, text_content, file_url, file_duration_sec, file_waveform, read_at, created_at }]
```

### POST /conversations
Start a conversation (authenticated, from listing).

```
Request:
  listing_id: uuid
  message: string (initial message text)

Response 201:
  id, listing_id, buyer_id, seller_id

Response 409: Conversation already exists (return existing id)
```

### POST /conversations/:id/messages
Send a message (participant only).

```
Request (text):
  content_type: "text"
  text_content: string

Request (image):
  content_type: "image"
  file: multipart/form-data

Request (voice note):
  content_type: "voice_note"
  file: multipart/form-data
  duration_sec: int
  waveform: number[]

Response 201:
  id, sender_id, content_type, text_content, file_url, file_duration_sec, created_at
```

---

## Quiz

### POST /quiz/recommend
Get car recommendations from lifestyle quiz.

```
Request:
  budget_max: int (EGP)
  daily_commute_km: int
  family_size: int

Response 200:
  recommendations: [{ listing summary with price_indicator }]
```

---

## Admin

### GET /admin/badges
List pending badge verification requests (admin only).

```
Query params: status? ("pending"|"approved"|"rejected"), page?, limit?

Response 200:
  items: [{ id, listing_id, badge_type, status, document_url, seller_name, created_at }]
```

### PATCH /admin/badges/:id
Approve or reject a badge (admin only).

```
Request:
  status: "approved" | "rejected"

Response 200: Updated badge
Response 403: Not admin
```

### POST /admin/badges/:id/document
Upload verification document (seller, for their own listing).

```
Request:
  file: multipart/form-data

Response 201:
  document_url: string
```

---

## WebSocket Events (Socket.IO)

Namespace: `/chat`

### Client → Server

| Event | Payload | Notes |
|-------|---------|-------|
| `join_conversation` | `{ conversation_id }` | Join room for real-time messages |
| `leave_conversation` | `{ conversation_id }` | Leave room |
| `send_message` | `{ conversation_id, content_type, text_content?, file? }` | Send message |
| `typing` | `{ conversation_id }` | Typing indicator |

### Server → Client

| Event | Payload | Notes |
|-------|---------|-------|
| `new_message` | `{ id, conversation_id, sender_id, content_type, ... }` | Incoming message |
| `message_read` | `{ message_id, conversation_id }` | Read receipt |
| `user_typing` | `{ conversation_id, user_id }` | Typing indicator |
| `conversation_updated` | `{ conversation_id, last_message }` | Conversation list update |