# User Flows

All flows below reflect the current working implementation.

## Actors

| Actor | How They Authenticate | What They Can Do |
|-------|----------------------|------------------|
| Couple | URL secret param `?s=<coupleSecret>` → stored in localStorage | Create event, edit event name/date, view all photos (public + private), toggle visibility, delete any photo, share event |
| Guest | Device UUID in localStorage + optional name | Upload photos, view public photos, delete own photos, download photos |

## Flow 1: Couple Creates Event

```
Route: /

1. Couple visits home page
2. Fills form:
   - Event name (required)
   - Date (optional, date picker)
   - Custom URL slug (optional, 3-40 chars, lowercase + hyphens)
   - Couple secret passphrase (optional, or auto-generated 32-char)
3. Submits → Convex creates event with slug + coupleSecret
4. Success screen shows:
   - QR code (for guest sharing)
   - Guest link: /e/{slug} (with copy button)
   - Couple link: /e/{slug}?s={secret} (with copy button)
5. Couple saves their secret link (only time it's shown)
```

**Implementation:** `EventCreateForm` (TanStack Form + Zod) → `api.events.create` → `EventCreateSuccess`

## Flow 2: Guest Joins Event + Takes Photo

```
Route: /e/{slug} → /e/{slug}/camera

1. Guest scans QR code or visits guest link
2. Lands on gallery page → sees existing public photos
3. Taps camera FAB (bottom-right, purple gradient)
4. Camera opens full-screen:
   - Video stream preview (mirrored for front camera)
   - Top bar: back button, zoom (0.5x/1x), camera flip
   - Bottom bar: time display, capture button, settings, gallery link
5. Guest taps capture → JPEG snapshot at 85% quality
6. First upload only: name dialog appears
   - Guest enters name → creates guest record with deviceId
   - Or taps "Skip" → uploads anonymously (no guestId)
7. Photo uploads: generateUploadUrl → POST blob → createPhoto record
8. Upload overlay shows during upload
9. Guest returns to gallery, photo appears
```

**Implementation:** `EventCameraView` → `useCamera` hook → `GuestNameDialog` → `usePhotoUpload` → `api.photos.create`

## Flow 3: Returning Guest

```
Route: /e/{slug}

1. Guest revisits event link
2. App reads deviceId from localStorage
3. Queries api.guests.getByDevice(eventId, deviceId)
4. If found → guest is recognized, no name prompt on next upload
5. If not found (cleared storage) → treated as new guest
```

**Implementation:** `useGuestSession` hook → localStorage check → Convex query

## Flow 4: Browse Gallery

```
Route: /e/{slug}

1. User visits event page
2. Header shows: event name, photo count, theme toggle
3. If couple (secret verified): "Couple View" badge, share button, sees ALL photos
4. If guest: sees public photos only
5. Toggle between grid view (3-column) and list view (single column)
6. Tap any photo → lightbox opens:
   - Full-screen image on black background
   - Arrow nav (left/right) + keyboard support
   - Photo counter ("3 of 12")
   - Download button (bottom-right)
   - Delete button (bottom-left, if owner or couple)
   - Visibility toggle (top-left, couple only)
   - Close button (top-right)
7. Private photos appear dimmed in couple view
```

**Implementation:** `EventGalleryView` → `ViewToggle` → `PhotoLightbox` → `DeletePhotoButton` → `VisibilityToggle`

## Flow 5: Couple Manages Photos

```
Route: /e/{slug}?s={secret}

1. Couple visits their secret link
2. useCoupleSession reads ?s= param, verifies via api.events.verifyCoupleSecret
3. Secret stored in localStorage, URL param cleaned
4. Gallery shows all photos (public + private)
5. Couple can:
   - Edit event name/date (pencil icon → EventEditDialog with pre-filled form)
   - Toggle any photo public/private (api.photos.toggleVisibility)
   - Delete any photo (api.photos.remove with coupleSecret)
   - Share event via dialog (QR code download, guest link, couple link)
6. Private photos show dimmed with eye-off icon
```

**Implementation:** `useCoupleSession` → `EventEditDialog` → `EventShareDialog` → `VisibilityToggle` → `DeletePhotoButton`

## Flow 6: Guest Deletes Own Photo

```
Route: /e/{slug} (lightbox open)

1. Guest opens their own photo in lightbox
2. Delete button visible (matched by deviceId → guestId → photo.guestId)
3. Taps delete → confirmation dialog
4. api.photos.remove called with deviceId (validates ownership)
5. Photo removed from storage + database
```

**Implementation:** `DeletePhotoButton` → `AlertDialog` → `api.photos.remove`

## Routes (Implemented)

| Route | Purpose | Who | Component |
|-------|---------|-----|-----------|
| `/` | Create event | Anyone | `EventCreateForm` + `EventCreateSuccess` |
| `/e/[slug]` | Event gallery | All (couple sees more) | `EventGalleryView` |
| `/e/[slug]/camera` | Capture photos | Guest | `EventCameraView` |

## Routes (Not Yet Built)

| Route | Purpose | Who | Notes |
|-------|---------|-----|-------|
| `/e/[slug]/manage` | Event settings / dashboard | Couple | Was planned, not implemented |
