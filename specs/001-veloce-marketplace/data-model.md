# Data Model: Veloce Car Marketplace

**Branch**: `001-veloce-marketplace` | **Date**: 2026-05-03

## Entities

### User

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| email | string | unique, not null, indexed | |
| display_name | string | not null, max 100 | |
| phone | string | nullable, indexed | Hidden from messaging by default |
| show_phone | boolean | default false | Seller-controlled per listing |
| avatar_url | string | nullable | Local storage URL |
| auth_provider | enum | not null | `google`, `facebook`, `email` |
| provider_id | string | nullable | OAuth provider subject ID |
| password_hash | string | nullable | For email auth only |
| language | enum | default `en` | `en`, `ar` |
| role | enum | default `user` | `user`, `admin` |
| created_at | datetime | not null | |
| last_login | datetime | nullable | |

**Relationships**: has many Listings, has many Conversations, has many Favorites

### Listing

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| seller_id | UUID | FK → User, not null, indexed | |
| make | string | not null, indexed | e.g., "Toyota" |
| model | string | not null, indexed | e.g., "Camry" |
| year | integer | not null, indexed | |
| price | integer | not null | EGP, stored as integer (cents) |
| transmission | enum | not null | `automatic`, `manual` |
| mileage | integer | nullable | km |
| condition | enum | not null | `new`, `used`, `used_like_new` |
| body_type | string | nullable | e.g., "Sedan", "SUV" |
| engine_size | string | nullable | e.g., "2.0L" |
| fuel_type | enum | nullable | `petrol`, `diesel`, `hybrid`, `electric` |
| color | string | nullable | |
| vin | string | nullable, indexed | 17 chars when provided |
| description | text | nullable | Free-text seller notes |
| district | string | not null, indexed | Egyptian district name |
| latitude | float | nullable | For radius search |
| longitude | float | nullable | For radius search |
| show_phone | boolean | default false | Seller toggle for this listing |
| status | enum | not null, default `draft`, indexed | `draft`, `published`, `sold`, `expired` |
| views_count | integer | default 0 | Denormalized for expiry check |
| last_activity_at | datetime | nullable | For 30-day expiry calculation |
| published_at | datetime | nullable | |
| created_at | datetime | not null | |
| updated_at | datetime | not null | |

**Relationships**: belongs to User (seller), has many Photos, has many VerificationBadges, has many Favorites, has many Conversations

### Photo

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| listing_id | UUID | FK → Listing, not null, indexed | |
| url | string | not null | Local storage path |
| thumbnail_url | string | nullable | Auto-generated small variant |
| position | integer | not null | Display order (0=front, 1=side, 2=interior...) |
| photo_type | enum | not null | `front`, `side`, `interior`, `other` |
| created_at | datetime | not null | |

**Relationships**: belongs to Listing

### Favorite

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| user_id | UUID | FK → User, not null | |
| listing_id | UUID | FK → Listing, not null | |
| created_at | datetime | not null | |

**Constraints**: unique together (user_id, listing_id)

### Conversation

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| buyer_id | UUID | FK → User, not null | |
| seller_id | UUID | FK → User, not null | |
| listing_id | UUID | FK → Listing, not null | |
| created_at | datetime | not null | |
| updated_at | datetime | not null | |

**Constraints**: unique together (buyer_id, listing_id) — one conversation per buyer per listing

### Message

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| conversation_id | UUID | FK → Conversation, not null, indexed | |
| sender_id | UUID | FK → User, not null | |
| content_type | enum | not null | `text`, `image`, `voice_note` |
| text_content | text | nullable | For text messages |
| file_url | string | nullable | Local storage path for images/voice notes |
| file_duration_sec | integer | nullable | Voice note duration |
| file_waveform | json | nullable | Waveform data for voice note visualization |
| read_at | datetime | nullable | Null = unread |
| created_at | datetime | not null | |

**Relationships**: belongs to Conversation, belongs to User (sender)

### VerificationBadge

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| listing_id | UUID | FK → Listing, not null, indexed | |
| badge_type | enum | not null | `one_owner`, `service_book_verified` |
| status | enum | not null, default `pending`, indexed | `pending`, `approved`, `rejected` |
| document_url | string | nullable | Local storage path for supporting docs |
| reviewed_by | UUID | FK → User, nullable | Admin who reviewed |
| reviewed_at | datetime | nullable | |
| created_at | datetime | not null | |

**Constraints**: unique together (listing_id, badge_type)

## State Transitions

### Listing Lifecycle

```
draft ──→ published ──→ sold
   │          │
   │          └──→ expired (auto after 30 days inactivity)
   │
   └──→ (can resume wizard, re-save as draft)

sold: irreversible (removed from active search, visible in seller history)
expired: seller can re-publish
```

### VerificationBadge Lifecycle

```
pending ──→ approved (badge displays on listing)
   │
   └──→ rejected (seller notified, can re-submit)
```

## Indexes

- `Listing`: (status), (make, model), (district), (price), (year), (seller_id)
- `Message`: (conversation_id, created_at)
- `Favorite`: (user_id, listing_id) unique
- `Conversation`: (buyer_id, listing_id) unique
- `VerificationBadge`: (listing_id, badge_type) unique, (status)