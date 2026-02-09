# User Flows

All user flows for the wedding photo sharing app. Updated to reflect current implementation.

## 1. Couple Creates Event

```mermaid
flowchart TD
    A[Couple visits /] --> B[Lands on home page]
    B --> C[Fills EventCreateForm]
    C --> C1[Event name - required]
    C --> C2[Date - optional picker]
    C --> C3[Custom slug - optional]
    C --> C4[Custom secret - optional]
    C1 & C2 & C3 & C4 --> F[Submits form]
    F --> G[api.events.create]
    G --> H[EventCreateSuccess screen]
    H --> H1[QR code for guests]
    H --> H2[Guest link with copy button]
    H --> H3[Couple link with copy button]
    H1 & H2 & H3 --> I[Couple saves secret link]
```

## 2. Guest First Visit + Photo Capture

```mermaid
flowchart TD
    A[Guest scans QR] --> B["Lands on /e/{slug}"]
    B --> C[Sees public photo gallery]
    C --> D[Taps camera FAB]
    D --> E["Opens /e/{slug}/camera"]
    E --> F[Full-screen camera preview]
    F --> G[Taps capture button]
    G --> H[JPEG snapshot at 85%]
    H --> I{First upload?}
    I -->|Yes| J[GuestNameDialog appears]
    J --> K{Enter name?}
    K -->|Yes| L[api.guests.create with deviceId]
    K -->|Skip| M[Upload without guestId]
    L --> N[generateUploadUrl + POST blob]
    M --> N
    I -->|No| N
    N --> O[api.photos.create]
    O --> P[Return to gallery]
```

## 3. Returning Guest

```mermaid
flowchart TD
    A[Guest revisits event link] --> B[Read deviceId from localStorage]
    B --> C[api.guests.getByDevice]
    C --> D{Guest found?}
    D -->|Yes| E[Recognized - no name prompt on next upload]
    D -->|No| F[Treated as new guest]
    E --> G[Gallery view]
    F --> G
```

## 4. Photo Capture & Upload

```mermaid
flowchart TD
    A["Guest on /e/{slug}/camera"] --> B[Camera stream active]
    B --> B1[Zoom: 0.5x / 1x]
    B --> B2[Camera flip: front / back]
    B --> B3[Mirrored preview for front cam]
    B1 & B2 & B3 --> C[Taps capture]
    C --> D[Canvas snapshot → JPEG blob]
    D --> E[Upload overlay shown]
    E --> F[generateUploadUrl]
    F --> G[POST blob to upload URL]
    G --> H[api.photos.create]
    H --> I[Upload overlay dismissed]
    I --> J[Toast success / error]
```

> **Note:** Offline queue is designed ([ADR 002](decisions/002-offline-queue.md)) but not yet implemented. Currently uploads fail silently if offline.

## 5. Browse Gallery

```mermaid
flowchart TD
    A["User visits /e/{slug}"] --> B[api.events.getBySlug]
    B --> C{Couple secret in localStorage?}
    C -->|Yes| D["api.photos.getByEvent(eventId, secret)"]
    C -->|No| E["api.photos.getByEvent(eventId)"]
    D --> F[Show ALL photos + Couple View badge]
    E --> G[Show public photos only]
    F & G --> H[Grid view / List view toggle]
    H --> I[Tap photo]
    I --> J[PhotoLightbox opens]
    J --> J1[Arrow nav + keyboard]
    J --> J2[Download button]
    J --> J3[Delete button - if owner or couple]
    J --> J4[Visibility toggle - couple only]
    J --> J5[Photo counter]
```

## 6. Couple Manages Photos

```mermaid
flowchart TD
    A["Couple visits /e/{slug}?s={secret}"] --> B[useCoupleSession reads param]
    B --> C[api.events.verifyCoupleSecret]
    C --> D{Valid?}
    D -->|Yes| E[Secret stored in localStorage]
    D -->|No| F[Treated as guest]
    E --> G[URL param cleaned]
    G --> H[Couple View active]
    H --> I[See all photos - private ones dimmed]
    H --> J[Share button → EventShareDialog]
    J --> J1[QR code download]
    J --> J2[Guest link copy]
    J --> J3[Couple link copy]
    H --> K[Toggle visibility per photo]
    H --> L[Delete any photo]
```

## 7. Guest Deletes Own Photo

```mermaid
flowchart TD
    A[Guest opens own photo in lightbox] --> B[Delete button visible]
    B --> C[Taps delete]
    C --> D[AlertDialog confirmation]
    D --> E["api.photos.remove(photoId, eventId, deviceId)"]
    E --> F[Backend validates: photo.guestId matches guest's deviceId]
    F --> G{Authorized?}
    G -->|Yes| H[Storage file + DB record deleted]
    G -->|No| I[Forbidden error]
```

## Page Map

```mermaid
flowchart LR
    subgraph Implemented
        HOME["/ (Home)"]
        EVENT["/e/:slug (Gallery)"]
        CAMERA["/e/:slug/camera"]
    end

    HOME -->|Create event| EVENT
    EVENT -->|Camera FAB| CAMERA
    CAMERA -->|Back button| EVENT
    EVENT -->|"?s= param"| EVENT
```

## Guest Session States

```mermaid
stateDiagram-v2
    [*] --> Anonymous: First visit (deviceId generated)
    Anonymous --> Gallery: View public photos
    Gallery --> Camera: Tap camera FAB
    Camera --> Capturing: Tap shutter
    Capturing --> NamePrompt: First upload
    NamePrompt --> Named: Enter name
    NamePrompt --> Anonymous: Skip
    Named --> Camera: Continue capturing
    Camera --> Gallery: Back button

    [*] --> Named: Return visit (deviceId + guestId in localStorage)
```

## Summary

| Flow | Status | Actors | Trigger | End State |
|------|--------|--------|---------|-----------|
| Create event | Done | Anyone | Visit home, fill form | Event exists, QR + links ready |
| Join event | Done | Guest | Scan QR / visit link | Gallery visible, camera accessible |
| Capture photo | Done | Guest | Tap capture on camera screen | Photo uploaded to gallery |
| Guest name | Done | Guest | First upload triggers dialog | Guest record created (or skipped) |
| Browse gallery | Done | All | Visit event page | Grid/list view with lightbox |
| Couple auth | Done | Couple | Visit with `?s=` param | All photos visible, management controls |
| Toggle visibility | Done | Couple | Tap toggle in lightbox | Photo public/private flipped |
| Delete photo | Done | Couple / Guest (own) | Tap delete in lightbox | Photo removed from storage + DB |
| Share event | Done | Couple | Tap share button | Dialog with QR, guest link, couple link |
| Offline queue | Not built | System | — | See [ADR 002](decisions/002-offline-queue.md) |
