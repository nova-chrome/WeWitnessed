# Data Model

All tables and access patterns below reflect the current working implementation.

## Tables

### events

The wedding event.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `name` | string | Event name ("Sarah & Mike's Wedding") |
| `slug` | string | URL-friendly ID for sharing (3-40 chars, lowercase + hyphens) |
| `date` | number? | Optional event date (timestamp) |
| `coupleSecret` | string | 32-char random or custom secret for couple auth |
| `createdAt` | number | Timestamp |

**Indexes:**
- `by_slug` on `slug` (for URL lookup)

### guests

Guest sessions (no account required).

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `eventId` | Id<"events"> | Parent event |
| `name` | string | Guest's display name |
| `deviceId` | string | Random UUID from client localStorage |
| `createdAt` | number | Timestamp |

**Indexes:**
- `by_event` on `eventId` (list guests for event)
- `by_event_device` on `[eventId, deviceId]` (find returning guest)

### photos

Uploaded photos.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `eventId` | Id<"events"> | Parent event |
| `guestId` | Id<"guests">? | Who uploaded (optional — null if guest skipped name) |
| `storageId` | Id<"_storage"> | Convex file storage reference |
| `isPublic` | boolean | Visible to all guests (default: true) |
| `createdAt` | number | Timestamp |

**Indexes:**
- `by_event` on `eventId` (couple gallery — all photos)
- `by_event_public` on `[eventId, isPublic]` (guest gallery — public only)
- `by_guest` on `guestId` (photos by a specific guest)

## Convex API

### Events (`convex/events.ts`)

| Function | Type | Args | Returns | Notes |
|----------|------|------|---------|-------|
| `create` | mutation | `name, date?, slug?, coupleSecret?` | `{id, slug, coupleSecret}` | Auto-generates slug/secret if not provided. Validates slug format. |
| `getBySlug` | query | `slug` | event (without coupleSecret) | Strips secret from response. Used for guest access. |
| `verifyCoupleSecret` | query | `eventId, coupleSecret` | boolean | Used by `useCoupleSession` hook. |

### Guests (`convex/guests.ts`)

| Function | Type | Args | Returns | Notes |
|----------|------|------|---------|-------|
| `getByDevice` | query | `eventId, deviceId` | guest or null | Detects returning guests. |
| `create` | mutation | `eventId, name, deviceId` | guestId | Called from `GuestNameDialog`. |

### Photos (`convex/photos.ts`)

| Function | Type | Args | Returns | Notes |
|----------|------|------|---------|-------|
| `generateUploadUrl` | mutation | none | upload URL string | Temporary URL for Convex storage upload. |
| `create` | mutation | `eventId, guestId?, storageId` | photoId | Records photo metadata. Defaults to `isPublic: true`. |
| `getByEvent` | query | `eventId, coupleSecret?` | photo[] with URLs | With secret: all photos. Without: public only. Newest first. |
| `remove` | mutation | `photoId, eventId, coupleSecret?, deviceId?` | null | Couple: delete any. Guest: delete own only. Deletes storage + DB. |
| `toggleVisibility` | mutation | `photoId, eventId, coupleSecret` | boolean (new state) | Couple-only. Flips `isPublic`. |

## Business Logic Layer (`convex/model/`)

| File | Functions | Purpose |
|------|-----------|---------|
| `model/events.ts` | `generateUniqueSlug`, `generateCoupleSecret`, `resolveSlug`, `resolveCoupleSecret`, `getEventBySlug`, `verifyCoupleSecret` | Slug generation (10-char random, retry on collision), secret generation (32-char), validation |
| `model/guests.ts` | `getGuestByDevice`, `createGuest` | Guest lookup by device index, guest insertion |
| `model/photos.ts` | `createPhoto`, `getEventPhotos`, `getPublicEventPhotos`, `deletePhoto`, `togglePhotoVisibility` | Photo CRUD, storage URL resolution, visibility control |

## Storage

Photos stored in Convex file storage (see [ADR 001](../decisions/001-storage.md)). Upload flow:
1. `generateUploadUrl()` → temporary upload URL
2. `POST` blob to URL → returns `storageId`
3. `create(eventId, guestId?, storageId)` → records metadata

## Access Control

| Action | Who | How |
|--------|-----|-----|
| Create event | Anyone | No auth needed |
| View event by slug | Anyone with link | `getBySlug` (secret stripped) |
| Create guest | Anyone with event link | Provide name + deviceId |
| Upload photo | Anyone with event link | guestId optional |
| View public photos | Anyone with event link | `getByEvent(eventId)` — no secret |
| View all photos | Couple | `getByEvent(eventId, coupleSecret)` |
| Toggle visibility | Couple | `toggleVisibility` requires valid coupleSecret |
| Delete any photo | Couple | `remove` with valid coupleSecret |
| Delete own photo | Guest | `remove` with deviceId (validated against photo's guestId) |

## localStorage Schema

Keys defined in `src/lib/storage-keys.ts`:

```typescript
{
  // Stable device identifier (generated once, never changes)
  "wewitnessed:deviceId": "uuid-v4",

  // Guest session per event (populated after name entry)
  "wewitnessed:guest:{slug}": { guestId: "convex-id", name: "Guest Name" },

  // Couple secret per event (populated after ?s= verification)
  "wewitnessed:couple:{slug}": "couple-secret-string"
}
```

## Offline Queue

**Status: Designed but not implemented.** See [ADR 002](../decisions/002-offline-queue.md) for the accepted design using IndexedDB.
