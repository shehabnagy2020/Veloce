# Feature Specification: Veloce Car Marketplace

**Feature Branch**: `001-veloce-marketplace`  
**Created**: 2026-05-03  
**Status**: Draft  
**Input**: User description: "Veloce Car Marketplace (Accessible PWA) — A high-contrast dark-mode car marketplace for the Egyptian market with advanced search, listing wizard, integrated messaging, creative utility features, and offline-first PWA capabilities."

## Clarifications

### Session 2026-05-03

- Q: How do users register and sign in to Veloce? → A: Social login (Google, Facebook) as primary, with email/password as fallback
- Q: Should the app support Arabic, English, or both? → A: Bilingual (Arabic + English), user-selectable
- Q: What states can a listing go through? → A: Four states: Draft → Published → Sold / Expired
- Q: What triggers the phone number reveal? → A: Seller sets a "show phone" toggle on their listing (seller-controlled)
- Q: How is concurrent buyer interest handled? → A: First-come-first-served; seller marks listing as "Sold" when deal is done

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search & Discover Cars (Priority: P1)

A buyer visits Veloce to find a car that fits their budget and location. They use faceted filters (make, model, price range, transmission, year) and optionally enable location-based radius filtering to narrow results to cars near their district in Egypt. They see a price comparison indicator on each listing showing whether the asking price is above, below, or at the local market average. They can share their filtered search results via a URL.

**Why this priority**: Search and discovery is the core value proposition — without it, no transactions can happen. It is the entry point for all buyers.

**Independent Test**: Can be fully tested by performing a filtered search, verifying filter state is reflected in the URL, and confirming price comparison indicators appear on listings. Delivers immediate value: buyers can find and compare cars.

**Acceptance Scenarios**:

1. **Given** a buyer is on the search page, **When** they apply filters for make, price range, and district, **Then** only matching listings are displayed and the URL updates to reflect the active filters
2. **Given** filtered search results are displayed, **When** the buyer copies and shares the URL, **Then** opening the URL on another device shows the same filtered results
3. **Given** a buyer views a listing, **When** the price comparison indicator is visible, **Then** it shows whether the price is above, below, or at the local market average for that make/model/year
4. **Given** a buyer enables location-based filtering, **When** they grant geolocation permission, **Then** listings within their selected radius of nearby Egyptian districts are shown

---

### User Story 2 - Create a Car Listing (Priority: P1)

A seller wants to list their car for sale. They start by entering or scanning their VIN, which auto-fills the vehicle specs (make, model, year, engine, transmission). The remaining steps are presented as focused card-based screens: a live price slider that shows a market comparison indicator in real time, a Ghost Frame photo capture overlay for properly aligned shots (front, side, interior), and a condition/district picker. Each card reveals naturally from the previous one, making the process feel like editing a pre-filled profile rather than filling a blank form. Images are automatically optimized client-side before upload to minimize data usage on Egyptian mobile networks. The seller can save as draft at any step and resume later.

**Why this priority**: Without listings, there is no marketplace. The VIN-first + card-based flow minimizes friction and makes the process feel effortless rather than form-like.

**Independent Test**: Can be fully tested by completing the listing flow end-to-end: VIN entry triggers auto-fill, price slider shows market comparison, Ghost Frame overlay appears during photo capture, and images are compressed before upload. Delivers value: sellers can list cars quickly.

**Acceptance Scenarios**:

1. **Given** a seller starts a new listing, **When** they enter a valid VIN, **Then** vehicle specs (make, model, year, engine, transmission) are auto-populated and the card advances to the price step
2. **Given** a seller reaches the price card, **When** they adjust the price slider, **Then** a live market comparison indicator shows whether their price is above, below, or at the local average for that make/model/year
3. **Given** a seller reaches the photo card, **When** they activate the camera, **Then** a Ghost Frame overlay guides alignment for front, side, and interior shots
4. **Given** a seller captures photos during listing, **When** they proceed to upload, **Then** images are automatically resized and converted to an efficient format client-side before being sent
5. **Given** a seller is partway through the listing, **When** they tap "Save as Draft," **Then** the listing is saved in draft status and they can resume from the same step later
6. **Given** a seller completes all steps, **When** they submit, **Then** the listing is published and visible to buyers in search results

---

### User Story 3 - Chat with Buyer/Seller (Priority: P2)

A buyer finds a car they are interested in and wants to negotiate. They use the integrated Veloce Messenger to send text messages, image attachments, and voice notes to the seller without revealing their personal phone number. Voice notes include a waveform visualization during recording and are compressed client-side before sending.

**Why this priority**: Messaging enables transactions but is secondary to having listings to browse and create. Privacy-first messaging is a key differentiator.

**Independent Test**: Can be fully tested by opening a conversation from a listing, sending text, an image attachment, and recording/sending a voice note. Delivers value: buyers and sellers can negotiate privately.

**Acceptance Scenarios**:

1. **Given** a buyer views a listing, **When** they tap the message button, **Then** a conversation thread opens with the seller without revealing either party's phone number
2. **Given** an active conversation, **When** a user sends a text message, **Then** the other party receives it in real time
3. **Given** an active conversation, **When** a user attaches an image, **Then** the image is displayed inline and delivered to the other party
4. **Given** an active conversation, **When** a user records a voice note, **Then** a waveform visualization shows during recording and the audio is compressed before sending
5. **Given** an active conversation, **When** a user plays a received voice note, **Then** the waveform is displayed and playback works correctly

---

### User Story 4 - Lifestyle Matchmaker Quiz (Priority: P2)

A buyer is unsure which car suits their needs. They take a short 3-step quiz covering their budget, daily commute distance, and family size. The quiz returns a curated list of car recommendations from the marketplace that match their lifestyle profile.

**Why this priority**: Helps convert undecided browsers into engaged buyers, but the marketplace functions without it.

**Independent Test**: Can be fully tested by completing the 3-step quiz and verifying recommended cars match the entered criteria. Delivers value: reduces decision friction for uncertain buyers.

**Acceptance Scenarios**:

1. **Given** a buyer starts the lifestyle quiz, **When** they complete all 3 steps (budget, commute, family size), **Then** a list of recommended cars from current listings is displayed
2. **Given** quiz results are displayed, **When** the buyer selects a recommended car, **Then** they are taken to that car's listing detail page
3. **Given** no listings match the quiz criteria, **When** results are shown, **Then** a helpful message indicates no current matches and suggests broadening criteria

---

### User Story 5 - Driveway Fit Overlay (Priority: P3)

A buyer wants to check if a car will physically fit in their parking space. They upload a photo of their parking area, and the app overlays a transparent, scaled 2D silhouette of the car on top of the photo so they can visually judge fitment.

**Why this priority**: A useful utility feature that reduces post-purchase regret, but not essential for core marketplace transactions.

**Independent Test**: Can be fully tested by uploading a parking space photo from any listing's detail page and verifying the 2D car overlay appears at correct scale. Delivers value: confidence in physical fitment.

**Acceptance Scenarios**:

1. **Given** a buyer is viewing a listing, **When** they choose the "Driveway Fit" option and upload a photo of their parking space, **Then** a transparent 2D silhouette of the car is overlaid on the photo at the correct scale
2. **Given** a driveway fit overlay is displayed, **When** the buyer adjusts the overlay position, **Then** the car silhouette moves accordingly for better alignment

---

### User Story 6 - Browse Favorites Offline (Priority: P3)

A buyer who has previously saved favorite car listings wants to view them while in an area with poor or no internet connectivity (common in parts of Egypt). Their saved listings and key details are available offline through the app's "Garage" mode.

**Why this priority**: Offline access is valuable in the Egyptian market with inconsistent connectivity, but it is an enhancement rather than a core requirement.

**Independent Test**: Can be fully tested by saving favorites while online, then going offline and verifying favorites are still accessible. Delivers value: access to saved listings without connectivity.

**Acceptance Scenarios**:

1. **Given** a buyer has saved favorite listings while online, **When** they lose internet connectivity, **Then** they can still view their saved listings with key details (photos, price, specs)
2. **Given** a buyer is offline and viewing saved listings, **When** they attempt to message a seller, **Then** the message is queued and sent automatically when connectivity is restored

---

### User Story 7 - Trust Verification Badges (Priority: P2)

A buyer wants assurance that a listing is legitimate. They see verification badges on listings such as "One Owner" and "Service Book Verified," which are awarded by internal admins after reviewing supporting documents submitted by the seller.

**Why this priority**: Trust is critical for a marketplace, especially in a market with fraud concerns. Badges increase buyer confidence and transaction likelihood.

**Independent Test**: Can be fully tested by an admin reviewing and approving documents for a listing, then verifying the badge appears on the listing for buyers. Delivers value: increased trust and safety.

**Acceptance Scenarios**:

1. **Given** a seller submits verification documents for their listing, **When** an admin reviews and approves them, **Then** the corresponding badge ("One Owner," "Service Book Verified") appears on the listing
2. **Given** a buyer views a listing with verification badges, **When** they tap on a badge, **Then** a brief explanation of what the badge means is displayed

---

### Edge Cases

- What happens when a buyer's browser does not support the Geolocation API? The location-based filter should gracefully fall back to manual district selection.
- What happens when VIN decoding fails (invalid VIN or service unavailable)? The seller should be able to manually enter vehicle specs without being blocked.
- What happens when image compression fails on the client side? The original image should be uploaded as a fallback with a warning about file size.
- What happens when a voice note recording is interrupted (e.g., incoming call)? The partial recording should be saved as a draft and the user prompted to re-record or send the partial note.
- What happens when a user attempts to send a message while offline? The message should be queued via Background Sync and sent when connectivity returns.
- What happens when no listings exist for a given search filter combination? A clear "no results" message should appear with suggestions to broaden filters.
- What happens when multiple buyers message the same seller about the same car? No reservation system — the seller negotiates independently and marks the listing as "Sold" once a deal is finalized.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow buyers to search and filter car listings by make, model, price range, transmission type, and year with results updating in real time
- **FR-002**: System MUST reflect active filter state in the URL so filtered views are shareable
- **FR-003**: System MUST display a price comparison indicator on each listing showing its position relative to the local market average for the same make/model/year
- **FR-004**: System MUST allow location-based filtering by Egyptian districts using browser geolocation, with manual district selection as fallback
- **FR-005**: System MUST provide a guided listing creation flow that starts with VIN entry (auto-filling vehicle specs), followed by card-based steps for price (with live market comparison slider), photo capture (with Ghost Frame overlay), and condition/district selection
- **FR-005a**: System MUST display a live price comparison indicator on the price card showing whether the seller's asking price is above, below, or at the local market average as they adjust the slider
- **FR-006**: System MUST automatically optimize listing images client-side (resize and convert to efficient format) before upload to minimize data usage
- **FR-007**: System MUST allow sellers to enter a VIN and auto-populate vehicle technical specifications from a VIN decoding service
- **FR-008**: System MUST allow manual entry of vehicle specs when VIN decoding is unavailable or fails
- **FR-009**: System MUST provide an integrated messaging system between buyers and sellers supporting text, image attachments, and voice notes
- **FR-010**: System MUST protect user privacy by default — phone numbers are hidden in messaging. Sellers can opt to display their phone number on their listing via a "show phone" toggle, giving them full control over when to reveal contact info
- **FR-011**: System MUST support voice note recording with waveform visualization and client-side audio compression
- **FR-012**: System MUST provide a 3-step lifestyle matchmaker quiz (budget, commute, family size) that returns curated car recommendations from current listings
- **FR-013**: System MUST provide a 2D "Driveway Fit" overlay feature allowing buyers to upload a parking space photo and overlay a scaled car silhouette
- **FR-014**: System MUST allow buyers to save favorite listings and access them offline when internet connectivity is unavailable
- **FR-015**: System MUST queue outgoing messages and listing submissions while offline and send them automatically when connectivity is restored
- **FR-016**: System MUST display trust verification badges ("One Owner," "Service Book Verified") on listings that have been reviewed and approved by an admin
- **FR-017**: System MUST provide an admin interface for reviewing seller-submitted verification documents and assigning badges
- **FR-018**: System MUST use a true-black background optimized for OLED displays to improve battery life on mobile devices
- **FR-020**: System MUST allow users to register and sign in via social login (Google, Facebook) as the primary method, with email and password as a fallback option
- **FR-021**: System MUST require authentication before creating a listing, sending a message, or saving favorites
- **FR-022**: System MUST support bilingual interface (Arabic and English) with user-selectable language preference, including right-to-left layout for Arabic
- **FR-023**: System MUST support listing lifecycle states: Draft (in-progress, not visible to buyers), Published (visible in search), Sold (marked as transaction complete), and Expired (auto-archived after a period of inactivity)
- **FR-024**: System MUST allow sellers to save a listing as a draft and resume the listing wizard later before publishing
- **FR-025**: System MUST automatically expire published listings after 30 days of inactivity (no views or messages) and notify the seller
- **FR-026**: System MUST allow sellers to mark their own listing as "Sold," removing it from active search results
- **FR-027**: System MUST not provide reservation or bidding — concurrent buyer interest is handled first-come-first-served at the seller's discretion

### Key Entities

- **Listing**: Represents a car for sale. Key attributes include make, model, year, price (EGP), transmission, mileage, condition, photos, location/district, VIN, verification badges, seller reference, and status (Draft / Published / Sold / Expired).
- **User**: Represents a buyer or seller. Key attributes include display name, email, profile info, saved favorites, conversation references, and authentication method (social or email/password). Phone numbers are stored but never exposed in messaging.
- **Conversation**: Represents a message thread between a buyer and seller about a specific listing. Contains text messages, image attachments, and voice notes.
- **Message**: A single message within a conversation. Can be text, image, or voice note with associated metadata (timestamp, sender, read status).
- **Verification Badge**: Represents a trust indicator assigned to a listing. Key attributes include badge type ("One Owner," "Service Book Verified"), status (pending/approved/rejected), and supporting documents.
- **Lifestyle Profile**: Represents a buyer's quiz responses (budget range, daily commute, family size) used to generate car recommendations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Buyers can find and view relevant car listings within 10 seconds of applying search filters
- **SC-002**: Sellers can create and publish a complete car listing in under 5 minutes
- **SC-003**: Messages are delivered between buyer and seller in under 2 seconds on a stable connection
- **SC-004**: Offline access to saved favorites is available within 1 second of app launch when disconnected
- **SC-005**: The app is installable as a PWA and launches in under 3 seconds on a mid-range mobile device
- **SC-006**: Image optimization reduces upload file size by at least 60% compared to original photos
- **SC-007**: 80% of buyers who complete the lifestyle quiz find at least one relevant car recommendation
- **SC-008**: Price comparison indicators are displayed on 100% of active listings with sufficient market data

## Assumptions

- Target users are primarily located in Egypt, with pricing in Egyptian Pounds (EGP)
- Users have smartphones with camera and microphone capabilities for the listing wizard and voice notes
- Users may have intermittent internet connectivity, particularly outside major urban centers
- The VIN decoding service is a third-party API; a fallback for manual entry is required
- An internal admin team exists to review verification documents and assign trust badges
- The marketplace initially focuses on used cars; new car listings may be added in the future
- Location-based filtering covers major Egyptian districts (New Cairo, Maadi, Dokki, etc.)
- Voice notes are limited to a reasonable duration (e.g., 2 minutes) for practical use
- The app is primarily used on mobile devices but must also work on desktop browsers
- The app must support bilingual Arabic and English with right-to-left layout for Arabic
- Image and voice note storage requires a cloud-based file storage service
- Preferred technology stack: React.js frontend, FastAPI (Python) backend, lightweight embedded database (e.g., SQLite)