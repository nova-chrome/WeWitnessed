# User Flows

## Actors

| Actor | Description |
|-------|-------------|
| Couple | Creates event, views all photos, controls visibility |
| Guest | Uploads photos, views public photos |

## Flow 1: Couple Creates Event

```
1. Couple visits app
2. Enters event name (e.g., "Sarah & Mike's Wedding")
3. Optionally sets event date
4. Gets shareable link + QR code
5. Shares QR with guests (print on table cards, etc.)
```

**Result:** Event exists, guests can join via link/QR.

## Flow 2: Guest Uploads Photo

```
1. Guest scans QR code (or visits link)
2. Sees camera interface (already built)
3. Takes photo
4. Optionally enters their name
5. Photo uploads to event
6. If offline: photo queued, uploads when online
```

**Result:** Photo appears in event gallery.

## Flow 3: View Gallery

```
1. User visits event page
2. Sees grid of photos
3. If guest: sees public photos only
4. If couple: sees all photos + can toggle visibility
```

**Result:** Users browse event photos.

## Flow 4: Toggle Photo Visibility (Couple Only)

```
1. Couple views photo
2. Taps visibility toggle
3. Photo becomes public or couple-only
```

**Result:** Photo visibility updated.

## Page Structure

| Route | Purpose | Who |
|-------|---------|-----|
| `/` | Landing / create event | Couple |
| `/e/[eventId]` | Event gallery | All |
| `/e/[eventId]/camera` | Capture photos | Guest |
| `/e/[eventId]/manage` | Event settings | Couple |
