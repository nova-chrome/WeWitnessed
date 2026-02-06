# ADR 002: Client-Side Offline Queue with IndexedDB

## Status

Accepted

## Context

Wedding venues often have poor WiFi. Guests need to capture photos even when offline, with automatic upload when connectivity returns.

## Decision

Implement offline queue entirely on the client using **IndexedDB** (via Dexie.js or idb).

The queue is independent of the storage provider - it holds blobs locally until they can be uploaded.

## How It Works

### Capture (Offline or Online)

```typescript
async function capturePhoto(blob: Blob, eventSlug: string, guestId: string) {
  if (navigator.onLine) {
    // Upload immediately
    await uploadToConvex(blob, eventSlug, guestId);
  } else {
    // Queue for later
    await queuePhoto(blob, eventSlug, guestId);
  }
}
```

### Queue Schema (IndexedDB)

```typescript
interface QueuedPhoto {
  id: string;           // UUID
  eventSlug: string;    // Target event
  guestId: string;      // Who captured it
  blob: Blob;           // The actual image data
  createdAt: number;    // Capture timestamp
  status: "pending" | "uploading" | "failed";
  retryCount: number;   // For exponential backoff
}
```

### Sync When Online

```typescript
async function syncQueue() {
  const pending = await db.queue
    .where("status")
    .equals("pending")
    .toArray();

  for (const item of pending) {
    try {
      // Mark as uploading
      await db.queue.update(item.id, { status: "uploading" });

      // 1. Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // 2. Upload blob
      const result = await fetch(uploadUrl, {
        method: "POST",
        body: item.blob,
      });
      const { storageId } = await result.json();

      // 3. Create photo record in Convex
      await createPhoto({
        eventSlug: item.eventSlug,
        guestId: item.guestId,
        storageId,
      });

      // 4. Remove from queue
      await db.queue.delete(item.id);

    } catch (error) {
      // Mark as failed, increment retry count
      await db.queue.update(item.id, {
        status: "failed",
        retryCount: item.retryCount + 1,
      });
    }
  }
}
```

### Trigger Sync

```typescript
// On app load
window.addEventListener("online", syncQueue);

// On visibility change (user returns to app)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && navigator.onLine) {
    syncQueue();
  }
});

// Periodic retry for failed uploads
setInterval(() => {
  if (navigator.onLine) {
    retryFailedUploads();
  }
}, 30000);
```

## UI Considerations

- Show badge with queued photo count
- Indicate sync status (uploading, failed)
- Allow manual retry for failed uploads
- Show "offline" indicator when disconnected

## Consequences

- Photos persist locally even if app is closed
- Works with any storage provider (Convex, S3, etc.)
- Need to handle storage quota (IndexedDB has limits)
- Should compress images before queueing to save space
- Must handle edge cases (user clears browser data, quota exceeded)

## Libraries

Consider using:

- **Dexie.js** - Nice IndexedDB wrapper with good TypeScript support
- **idb** - Lightweight alternative
- **localforage** - Simpler API but less control
