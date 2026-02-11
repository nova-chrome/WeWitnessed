# Post-MVP Features

Feature sets for building after MVP. Each feature includes enough context to prompt directly.

> **How to use this doc**: Copy a feature section into a prompt. Each one includes what to build, where to build it, what already exists, and acceptance criteria.

---

## Set 1: Cleanup & Polish

Small improvements to tighten the existing MVP before adding new features.

### 1.1 Event Editing ✅

**Status**: Complete

**What was built**:
- Backend: `updateEvent` helper in `convex/model/events.ts` + `update` mutation in `convex/events.ts`
- Frontend: `EventEditDialog` in `src/features/events/components/event-edit-dialog.tsx` (TanStack Form + Zod + Calendar + sonner toasts)
- Pencil icon button in gallery header (couple view only) opens the edit dialog

**Acceptance criteria** (all met):
- Couple can edit event name and date from the gallery page
- Requires valid coupleSecret (verified in model layer)
- Changes reflect immediately (Convex reactivity)
- Slug and secret cannot be changed after creation

---

### 1.2 Event Deletion ✅

**Status**: Complete

**What was built**:
- Backend: `remove` mutation in `convex/events.ts` + `deleteEvent` cascade helper in `convex/model/events.ts` (deletes storage files, photo records, guest records, then event)
- Frontend: `EventDeleteDialog` in `src/features/events/components/event-delete-dialog.tsx` with hold-to-delete button (5-second progress bar) instead of nested AlertDialog
- Accessible from the edit event dialog (couple view only)

**Acceptance criteria** (all met):
- Couple can delete event from gallery page
- Hold-to-delete confirmation warns about permanent deletion
- All photos removed from Convex storage
- All guest records removed
- Event record removed
- Redirects to home page after deletion

---

### 1.3 Gallery Empty State ✅

**Status**: Complete

**What was built**:
- Role-aware empty state in `src/app/e/[slug]/_components/event-gallery-view.tsx`
- Guest view: HeartIcon + encouraging message + animated curved arrow pointing to camera FAB
- Couple view: HeartIcon + message + "Invite guests" button that opens EventShareDialog
- Extended `EventShareDialog` to accept children for custom trigger rendering
- Added `bounce-subtle` CSS keyframe animation in `globals.css`

**Acceptance criteria** (all met):
- Guest sees: encouraging message + animated arrow pointing to camera FAB
- Couple sees: message + share button to invite guests
- Feels warm and wedding-appropriate, not clinical

---

### 1.4 Dynamic Open Graph Meta ✅

**Status**: Complete

**What was built**:
- Backend: `getOgData` query in `convex/events.ts` returning event name, date, photo count, and latest public photo URL. Supporting helpers `getPublicPhotoCount` and `getLatestPublicPhotoUrl` in `convex/model/photos.ts`
- Frontend: `generateMetadata` in `src/app/e/[slug]/page.tsx` using `fetchQuery` from `convex/nextjs` for dynamic title, description, OpenGraph, and Twitter card meta tags
- Frontend: `src/app/e/[slug]/opengraph-image.tsx` generating a 1200×630 PNG with latest event photo as background, dark gradient overlay, event name, photo count, date, and WeWitnessed branding

**Acceptance criteria** (all met):
- Sharing `/e/{slug}` on iMessage/WhatsApp shows: event name, photo count, "WeWitnessed" branding
- Latest public photo used as OG image background (gradient fallback when no photos)
- Falls back gracefully if event not found

---

### 1.5 Loading Skeleton for Gallery ✅

**Status**: Complete

**What was built**:
- Installed shadcn/ui Skeleton component (`src/components/ui/skeleton.tsx`) with `bg-muted` pulse
- Replaced diamond spinner with full-page skeleton for event loading — "W" logo + header pills + 3×3 photo grid
- Added separate gallery skeleton for photos loading (event loaded, photos still pending)
- Both skeletons use identical `grid grid-cols-3 gap-0.5` layout to prevent layout shift

**Acceptance criteria** (all met):
- Gallery shows placeholder grid (gray rectangles) while `api.photos.getByEvent` loads
- Smooth transition from skeleton to real photos
- No layout shift when photos appear

---

### 1.6 Camera Permission UX ✅

**Status**: Complete

**What was built**:

- New utility `src/features/camera/utils/camera-permissions.ts` with `getDeviceInstructions()` (detects iOS Safari, iOS Chrome, Android, desktop Safari, Firefox, Chromium) and `queryCameraPermission()` (wraps `navigator.permissions.query` with `tryCatch` fallback)
- Enhanced error state in `src/features/camera/components/camera-screen.tsx` with camera icon, device-specific instruction text, and "Try Again" button
- Exposed `retryCamera` on `useCamera` hook to allow re-requesting camera access from the UI

**Acceptance criteria** (all met):
- Show device-specific instructions ("Open Settings > Safari > Camera" on iOS)
- Include a "Try Again" button that re-requests permission
- Detect permission state via `navigator.permissions.query` if available

---

## Set 2: Photo Experience

Features that improve the core photo capture and viewing loop.

### 2.1 Upload from Photo Library ✅

**Status**: Complete

**What was built**:

- Refactored `GuestNameDialog` (`src/features/guests/components/guest-name-dialog.tsx`) to decouple from blob/upload — replaced `blob` + `uploadPhoto` props with generic `onComplete(guestId)` callback
- Added secondary upload FAB (smaller, above camera FAB) on gallery page using `ImageIcon`
- Hidden `<input type="file" accept="image/*" multiple>` triggers native photo picker on tap
- Sequential multi-file upload with per-file error handling and success/failure toasts
- Guest name prompt triggers on first upload if no guestId exists (reuses `GuestNameDialog`)
- Updated empty state hint text to mention both camera and upload options
- Adapted `EventCameraView` to use new `GuestNameDialog` interface (no behavioral change)

**Acceptance criteria** (all met):
- Guest can pick one or more photos from their device gallery
- Photos upload using the same flow as camera captures
- Guest name prompt still triggers on first upload if not registered
- Works on iOS Safari, Android Chrome

---

### 2.2 Multi-Photo Capture ✅

**Status**: Complete

**What was built**:

- New `useCaptureSession` hook (`src/features/photos/hooks/use-capture-session.ts`) — fire-and-forget captures with blob thumbnails, session count, and per-capture status tracking
- Refactored `usePhotoUpload` (`src/features/photos/hooks/use-photo-upload.ts`) to support concurrent uploads via `activeCount` counter instead of single `isUploading` boolean
- Rewired `EventCameraView` to use `useCaptureSession` — removed blocking upload guard and per-photo toasts
- Removed full-screen upload overlay from `CameraScreen`, replaced with session counter pill below zoom controls in `CameraSettings`
- Gallery button in `CameraControls` now a `Link` to event page, shows last capture thumbnail (iOS Camera style)

**Acceptance criteria** (all met):

- After capture, camera stays active for next shot (no navigation away)
- Small thumbnail preview of last capture appears in gallery button
- Upload happens in background (non-blocking)
- Counter shows "3 photos" during session below zoom controls
- Guest can return to gallery when done

---

### 2.3 Photo Captions ✅

**Status**: Complete

**What was built**:

- Backend: `caption: v.optional(v.string())` field on `photos` table in `convex/schema.ts`
- Backend: `updateCaption` mutation in `convex/photos.ts` (guest-only auth via deviceId)
- Backend: `updatePhotoCaption` in `convex/model/photos.ts`
- Frontend: `PhotoCaption` component in `src/features/photos/components/photo-caption.tsx` — inline edit with textarea, save/cancel, character counter
- Frontend: Integrated into lightbox (`photo-lightbox.tsx`) and list view (`event-gallery-view.tsx`) with gradient overlay

**Acceptance criteria** (all met):

- Caption is optional (can skip)
- Max 200 characters (enforced client + server)
- Added post-upload (not during), keeping uploads fast
- Visible in lightbox and list view
- Only the photo owner can add/edit captions
- Couple can see captions on all photos

---

### 2.4 Photo Reactions ✅

**Status**: Complete

**What was built**:
- Backend: `reactions` table in `convex/schema.ts` with `photoId`, `eventId`, `deviceId`, `emoji`, `createdAt` and indexes `by_photo`, `by_photo_device`, `by_event`
- Backend: `convex/reactions.ts` with `toggle`, `getByPhoto`, `getCountsByEvent` functions; business logic in `convex/model/reactions.ts`
- Backend: Cascade-delete reactions in `convex/model/photos.ts` (photo delete) and `convex/model/events.ts` (event delete)
- Frontend: `ReactionBar` component in `src/features/reactions/components/reaction-bar.tsx` — 5 emoji buttons with counts, highlights user's active reaction
- Frontend: `ReactionBadge` component in `src/features/reactions/components/reaction-badge.tsx` — compact heart+count overlay for grid thumbnails
- Frontend: Integrated into lightbox (`photo-lightbox.tsx`) and gallery (`event-gallery-view.tsx`) in both grid and list views

**Acceptance criteria** (all met):
- Fixed set of 5 emoji options (heart, fire, laugh, cry, clap)
- One reaction per guest per photo (tap again to remove)
- Reaction count shown on photo in gallery grid
- No authentication required (uses deviceId)

---

### 2.5 Bulk Download (Couple)

**What**: Let the couple download all event photos as a zip file.

**Where to build**:
- Frontend: Add "Download All" button to couple view gallery header
- Use client-side zip generation (e.g., JSZip or fflate library)
- Fetch all photo URLs from `api.photos.getByEvent`, download blobs, zip them

**What exists**: Individual photo download works in lightbox. Photo URLs come from Convex storage.

**Acceptance criteria**:
- Couple-only (requires coupleSecret)
- Progress indicator during download/zip
- Zip file named `{event-name}-photos.zip`
- Photos named sequentially or by timestamp
- Works for events with 50+ photos (streaming zip if needed)

---

### 2.6 Slideshow Mode

**What**: Auto-cycling full-screen photo slideshow for projecting at the reception.

**Where to build**:
- New route: `/e/[slug]/slideshow` or modal overlay on gallery
- Subscribe to `api.photos.getByEvent` for real-time updates (new photos appear live)
- Configurable interval (5s, 10s, 15s)

**What exists**: Photo lightbox has full-screen display and arrow navigation. Convex queries are reactive.

**Acceptance criteria**:
- Full-screen, no UI chrome (clean for projection)
- Auto-advances every N seconds
- New photos appear in rotation without page refresh (Convex reactivity)
- Tap/click pauses auto-advance
- Escape exits slideshow
- Optional: show guest name + caption overlay
- Works well on laptop connected to projector

---

## Set 3: Couple Dashboard

Give the couple a proper management surface beyond the inline gallery controls.

### 3.1 Couple Dashboard Page ✅

**Status**: Complete

**What was built**:
- New route: `src/app/e/[slug]/manage/page.tsx` with couple-only access via `useCoupleSession`
- Backend: `getEventStats` query in `convex/events.ts` returning photo count, guest count, latest activity
- Frontend: Dashboard components in `src/features/dashboard/` with event details, stats overview, and quick actions (share, delete event)
- Link from gallery header (couple view) navigates to `/e/[slug]/manage`

**Acceptance criteria** (all met):
- Accessible only with valid coupleSecret
- Link from gallery header (couple view)
- Shows event stats at a glance
- All management actions accessible from here

---

### 3.2 Guest List View

**What**: Show the couple who has contributed photos.

**Where to build**:
- Backend: Add query in `convex/guests.ts` — `getByEvent(eventId)` returning guests with photo counts
- Frontend: Section in couple dashboard or standalone tab

**What exists**: `by_event` index on guests table. `by_guest` index on photos table.

**Acceptance criteria**:
- List of guest names with photo count per guest
- Sorted by most recent activity
- Tapping a guest filters gallery to their photos
- Shows total guest count

---

### 3.3 Activity Feed

**What**: Real-time feed of event activity for the couple.

**Where to build**:
- Could be derived from photos + guests tables (no new table needed)
- Query: recent photos with guest names, sorted by createdAt
- Section in couple dashboard

**What exists**: Photos have `createdAt` timestamps and optional `guestId` references. Convex queries are reactive.

**Acceptance criteria**:
- Shows "Sarah uploaded a photo" style entries
- Real-time updates (Convex reactivity)
- Last 20-50 activities
- Timestamps (relative: "2 minutes ago")

---

## Set 4: Event Customization

Let couples make their event page feel personal.

### 4.1 Event Theme/Color

**What**: Let the couple pick a color accent for their event page.

**Where to build**:
- Backend: Add `theme` (optional string) field to events table
- Frontend: Color picker in event creation form (or dashboard)
- Apply as CSS custom property to event pages

**What exists**: Dark/light theme via next-themes. Tailwind CSS 4 with CSS custom properties.

**Acceptance criteria**:
- 6-8 preset color options (no free-form color picker)
- Color applies to: camera FAB, buttons, accents on event page
- Falls back to default purple if not set
- Persists across visits

---

### 4.2 Cover Photo

**What**: Let the couple set a hero photo for their event gallery page.

**Where to build**:
- Backend: Add `coverPhotoId` (optional Id<"photos">) to events table
- Frontend: "Set as cover" option in lightbox (couple only)
- Gallery page shows cover at top

**What exists**: Photo lightbox with couple-only controls. Event gallery header.

**Acceptance criteria**:
- Couple selects any uploaded photo as cover
- Cover displays as banner at top of gallery
- Can be changed or removed
- Looks good on mobile (responsive aspect ratio)

---

### 4.3 Welcome Message

**What**: Custom welcome text shown on the event gallery page.

**Where to build**:
- Backend: Add `welcomeMessage` (optional string) to events table
- Frontend: Editable in dashboard, displayed on gallery page above photos

**What exists**: Gallery header shows event name. Event creation form.

**Acceptance criteria**:
- Max 280 characters
- Displayed between header and photo grid
- Couple can edit from dashboard
- Optional — gallery looks fine without one

---

### 4.4 Display Event Date

**What**: Show the event date on the gallery page (currently stored but not displayed).

**Where to build**: `src/app/e/[slug]/_components/event-gallery-view.tsx` — add date display to header.

**What exists**: `date` field exists on events table (optional number timestamp). `date-fns` is installed.

**Acceptance criteria**:
- Date shown in gallery header below event name
- Formatted nicely (e.g., "Saturday, May 17, 2025")
- Only shown if date was set
- Respects locale

---

## Set 5: PWA & Offline

Make the app work reliably at venues with poor WiFi.

### 5.1 Offline Photo Queue

**What**: Cache photos locally when offline, auto-upload when connection returns.

**Where to build**: See [ADR 002](../decisions/002-offline-queue.md) for the full accepted design.

**Summary**:
- IndexedDB storage for photo blobs via Dexie.js or idb
- Queue schema: id, eventSlug, guestId, blob, createdAt, status, retryCount
- Sync triggers: online event, visibility change, periodic retry
- UI: queued photo count badge, sync status indicator

**What exists**: ADR accepted, service worker shell at `/public/sw.js`, PWA manifest configured.

**Acceptance criteria**:
- Photos captured offline are stored in IndexedDB
- Auto-sync when connection returns
- Badge shows queued count
- Retry with exponential backoff on failure
- Works after app is closed and reopened

---

### 5.2 App Shell Caching

**What**: Cache static assets so the app loads instantly on revisit.

**Where to build**: Upgrade `/public/sw.js` with proper caching strategy.

**What exists**: Minimal service worker that only enables installability.

**Acceptance criteria**:
- Shell (HTML, CSS, JS, fonts) cached on first visit
- App loads from cache on revisit (even offline)
- Stale-while-revalidate for assets
- Cache versioning for updates

---

### 5.3 Install Prompt

**What**: Actively prompt guests to install the PWA when they visit an event.

**Where to build**: Enhance `src/components/pwa-register.tsx` to capture `beforeinstallprompt` event.

**What exists**: PWA manifest + service worker. `PWARegister` component in root layout.

**Acceptance criteria**:
- Banner appears on first visit (dismissable)
- Only shows on supported browsers (Chrome, Edge, Samsung)
- "Add to Home Screen" button
- Doesn't show again after dismissal (localStorage flag)

---

## Set 6: Auth & Identity (Future)

These features require some form of persistent identity beyond deviceId + coupleSecret. Only pursue if the app needs to support multi-event couples or cross-device access.

### 6.1 Couple Accounts

**What**: Lightweight email-based auth for couples (not guests).

**Why**: Enables secret recovery, multi-event support, cross-device access, email notifications.

**Considerations**:
- Magic link (passwordless) keeps it simple
- Clerk or custom email + OTP via Convex
- Guests should never need an account

---

### 6.2 Pre-Identified Guest Links

**What**: Generate unique guest links that auto-identify guests without name prompt.

**Example**: `/e/{slug}?g={guestToken}` — couple generates links per guest from dashboard.

**Why**: Better attribution, no name prompt friction, couple controls the invite list.

---

### 6.3 Route Middleware

**What**: Add Next.js middleware for couple route protection.

**Why**: Currently no `middleware.ts`. Couple pages rely on client-side auth checks.

**Considerations**: Middleware can redirect unauthenticated access to `/e/{slug}` (guest view) instead of showing empty couple features.
