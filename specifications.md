# Feature Specification: Veloce Car Marketplace (Accessible PWA)

**Brand Identity:** Veloce (Italian for Speed)  
**Design Theme:** "The Cockpit" (High-Contrast Dark Mode)  
**Target Platform:** Next.js PWA 

---

## 1. Core Marketplace Features

### A. Advanced Search & Discovery
* **Faceted Filtering:** Real-time filtering by Make, Model, Price Range (EGP), Transmission, and Year.
* **Location-Based Radius:** Filter by major Egyptian districts (New Cairo, Maadi, Dokki, etc.) using the browser Geolocation API.
* **Price Comparison Engine:** Visual indicator on listings showing how the price sits relative to the local market average.
* **Technicality:** Managed via `URLSearchParams` for shareable filtered views and Mantine's `RangeSlider` for UI.

### B. Lightweight Listing Wizard
* **Guided Photo Capture:** An overlay UI ("Ghost Frame") to help sellers align car shots consistently (Front, Side, Interior).
* **Automated Image Optimization:** Client-side resizing and WebP conversion before upload to minimize data usage.
* **Manual/API VIN Decoding:** Fetch technical vehicle specs automatically via VIN entry to ensure data accuracy.
* **Technicality:** Use `browser-image-compression` and `react-hook-form` with `Zod` validation.

### C. Integrated Veloce Messenger
* **Inline Multimedia Chat:** Native messaging supporting normal text, image attachments, and voice notes.
* **Voice Note Integration:** In-app recording with waveform visualization and client-side compression for engine sounds.
* **Privacy-First Design:** Direct buyer-seller negotiation without exposing personal phone numbers until the point of sale.
* **Technicality:** Real-time layer via **Socket.io**; binary file handling for audio/images stored in **AWS S3/Cloudinary**.

---

## 2. High-Utility Creative Features (Accessibility-Focused)

### A. 2D "Driveway Fit" Overlay
* **Feature:** Buyer uploads a photo of their parking space; app overlays a transparent, scaled 2D car silhouette.
* **Benefit:** Provides the utility of AR (checking fitment) without requiring LiDAR or high-end sensors.
* **Technicality:** HTML5 Canvas API for image layering and scaling.

### B. Lifestyle Matchmaker Quiz
* **Feature:** A short 3-step quiz (Budget, Daily Commute, Family Size) that generates a curated list of car recommendations.
* **Technicality:** Local JSON logic filtering rather than expensive LLM API calls.

### C. Trusted Verification System
* **Feature:** Manual badge system ("One Owner," "Service Book Verified") managed by an internal admin dashboard.
* **Technicality:** Admin UI built with **Mantine DataGrid** for efficient document review.

---

## 3. PWA & Performance (The Senior Edge)

### A. Offline "Garage" Mode
* **Feature:** Buyers can access and view their "Favorite" car listings even without internet access.
* **Technicality:** Persistent storage using **IndexedDB** and Service Worker caching via **Workbox**.

### B. Background Sync
* **Feature:** Ensures listing posts or messages are sent automatically once a user moves from a dead zone to a signal area.
* **Technicality:** Service Worker Background Sync API.

### C. Battery-Saving "Cockpit" UI
* **Feature:** True-black background (`#0B0E14`) optimized for OLED displays to improve battery life on mobile.
* **Technicality:** Mantine `ColorSchemeProvider` forced to dark mode with CSS variables.

---

## 4. Technical Stack Summary
* **Framework:** Next.js (App Router).
* **UI/UX:** Mantine UI + Framer Motion for smooth transitions.
* **State Management:** TanStack Query (Server State) + Zustand (UI State).
* **Backend Layer:** Node.js + PostgreSQL (Prisma ORM).
"""