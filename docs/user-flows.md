# User Flows

All user flows for the wedding photo sharing app.

## 1. Couple Creates Event

```mermaid
flowchart TD
    A[Couple visits app] --> B[Lands on home page]
    B --> C[Enters event name]
    C --> D{Add date?}
    D -->|Yes| E[Picks date]
    D -->|No| F[Clicks Create]
    E --> F
    F --> G[Backend creates event + coupleSecret]
    G --> H[Shows QR code + shareable link]
    H --> I[Couple saves secret link]
    H --> J[Couple shares QR with guests]
```

## 2. Guest First Visit

```mermaid
flowchart TD
    A[Guest scans QR] --> B[Lands on event page]
    B --> C{Has guestId in localStorage?}
    C -->|No| D[Show name modal]
    D --> E[Guest enters name]
    E --> F[Generate deviceId if needed]
    F --> G[Create guest in Convex]
    G --> H[Store guestId in localStorage]
    H --> I[Show camera]
    C -->|Yes| I
```

## 3. Guest Returns

```mermaid
flowchart TD
    A[Guest visits event link] --> B[Check localStorage for guestId]
    B --> C{guestId exists?}
    C -->|Yes| D[Fetch guest from Convex]
    D --> E{Guest found?}
    E -->|Yes| F[Show camera with name]
    E -->|No| G[Show name modal]
    C -->|No| G
    G --> H[Re-register guest]
    H --> F
```

## 4. Photo Capture & Upload

```mermaid
flowchart TD
    A[Guest on camera screen] --> B[Taps capture]
    B --> C[Photo captured from stream]
    C --> D{Online?}
    D -->|Yes| E[Upload to Convex storage]
    E --> F[Create photo record]
    F --> G[Show success feedback]
    D -->|No| H[Save to IndexedDB queue]
    H --> I[Show queued indicator]
    I --> J{Connection restored?}
    J -->|Yes| K[Sync queued photos]
    K --> E
```

## 5. View Gallery

```mermaid
flowchart TD
    A[User taps Gallery] --> B[Load event photos]
    B --> C{Is couple?}
    C -->|Yes| D[Fetch all photos]
    C -->|No| E[Fetch public photos only]
    D --> F[Show gallery grid]
    E --> F
    F --> G[Tap photo]
    G --> H[Show full photo view]
```

## 6. Toggle Photo Visibility (Couple Only)

```mermaid
flowchart TD
    A[Couple views photo] --> B{Has coupleSecret?}
    B -->|No| C[No toggle shown]
    B -->|Yes| D[Show visibility toggle]
    D --> E[Couple taps toggle]
    E --> F[Update isPublic in Convex]
    F --> G{New state?}
    G -->|Public| H[Guests can see photo]
    G -->|Private| I[Only couple sees photo]
```

## 7. Offline Queue Sync

```mermaid
flowchart TD
    A[App loads] --> B[Check IndexedDB queue]
    B --> C{Pending photos?}
    C -->|No| D[Done]
    C -->|Yes| E{Online?}
    E -->|No| F[Wait for connection]
    F --> E
    E -->|Yes| G[Get next queued photo]
    G --> H[Upload to Convex]
    H --> I{Success?}
    I -->|Yes| J[Remove from queue]
    I -->|No| K[Retry later]
    J --> L{More in queue?}
    L -->|Yes| G
    L -->|No| D
```

## Page Map

```mermaid
flowchart LR
    subgraph Public
        HOME["/ (Home)"]
        EVENT["/e/:slug (Gallery)"]
        CAMERA["/e/:slug/camera"]
    end

    subgraph Couple Only
        MANAGE["/e/:slug/manage"]
    end

    HOME -->|Create event| EVENT
    EVENT -->|Scan QR| CAMERA
    CAMERA -->|View photos| EVENT
    EVENT -->|Secret link| MANAGE
    MANAGE -->|Back| EVENT
```

## Guest Session States

```mermaid
stateDiagram-v2
    [*] --> NoSession: First visit
    NoSession --> NamePrompt: Show modal
    NamePrompt --> Registered: Submit name
    Registered --> Camera: Ready
    Camera --> Capturing: Tap shutter
    Capturing --> Camera: Done
    Camera --> Gallery: View photos
    Gallery --> Camera: Back

    [*] --> Registered: Return visit (localStorage)
```

## Summary

| Flow | Actors | Trigger | End State |
|------|--------|---------|-----------|
| Create event | Couple | Visit home, fill form | Event exists, QR ready |
| Join event | Guest | Scan QR | Guest registered, camera ready |
| Capture photo | Guest | Tap shutter | Photo in gallery (or queue) |
| View gallery | All | Tap gallery | See photos |
| Toggle visibility | Couple | Tap toggle | Photo public/private |
| Sync queue | System | Connection restored | Queued photos uploaded |
