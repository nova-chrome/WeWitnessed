# Data Model

## Tables

### events

The wedding event.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `name` | string | Event name ("Sarah & Mike's Wedding") |
| `slug` | string | URL-friendly ID for sharing |
| `date` | number? | Optional event date (timestamp) |
| `coupleSecret` | string | Secret token for couple access |
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
| `guestId` | Id<"guests">? | Who uploaded (optional for migration) |
| `storageId` | Id<"_storage"> | Convex file storage reference |
| `isPublic` | boolean | Visible to all guests (default: true) |
| `createdAt` | number | Timestamp |

**Indexes:**
- `by_event` on `eventId` (for gallery queries)
- `by_event_public` on `[eventId, isPublic]` (for guest gallery)
- `by_guest` on `guestId` (photos by a specific guest)

## Storage

Photos stored in Convex file storage. Each photo record references a `storageId`.

## Guest Session Flow

```
First Visit:
1. Client generates deviceId (UUID), stores in localStorage
2. Guest scans QR → lands on event page
3. Modal: "What's your name?"
4. Client calls createGuest(eventId, name, deviceId)
5. Convex returns guestId
6. Client stores { [eventSlug]: guestId } in localStorage

Returning Visit:
1. Client reads deviceId from localStorage
2. Client queries getGuestByDevice(eventId, deviceId)
3. If found → use existing guestId
4. If not found → show name prompt again

Uploading:
1. Photo upload includes guestId
2. Gallery shows "Photo by [guest.name]"
```

## Access Control

| Action | Who | How |
|--------|-----|-----|
| Create event | Anyone | No auth needed |
| Create guest | Anyone with event link | Provide name + deviceId |
| View public photos | Anyone with event link | Query by eventId + isPublic |
| View all photos | Couple | Must provide coupleSecret |
| Toggle visibility | Couple | Must provide coupleSecret |
| Upload photo | Guest | Must have guestId for event |

## Offline Queue (Client-Side)

Not in Convex. Stored in IndexedDB on device:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Local UUID |
| `eventSlug` | string | Target event |
| `guestId` | string | Guest's Convex ID |
| `imageBlob` | Blob | Photo data |
| `createdAt` | number | Capture timestamp |
| `status` | string | "pending" or "uploading" |

Synced to Convex when online.

## localStorage Schema

```typescript
{
  // Stable device identifier (generated once, never changes)
  "wewitnessed:deviceId": "uuid-v4",

  // Guest ID per event (populated after name entry)
  "wewitnessed:guest:wedding-slug": "convex-guest-id",
  "wewitnessed:guest:another-event": "convex-guest-id"
}
```
