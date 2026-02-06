# MVP Scope

## Target Date

Mid-May 2025 (cousin's wedding)

## In Scope

### Must Have

| Feature | Description |
|---------|-------------|
| Event creation | Couple creates event, gets shareable link/QR |
| Guest upload | Camera capture → upload to event |
| Gallery view | View all photos for an event |
| Public/private toggle | Per-photo visibility control |
| Offline queue | Store locally, sync when online |

### Nice to Have

| Feature | Description |
|---------|-------------|
| Guest name | Optional "who took this?" field |
| Download all | Couple can download zip of photos |

## Out of Scope

- Video capture/upload
- User accounts for guests
- AI features (tagging, storytelling)
- Photo editing
- Comments/reactions
- Multiple events per couple
- Payment/monetization

## Current Progress

| Component | Status |
|-----------|--------|
| Camera capture UI | Done |
| PWA setup | Done |
| Convex schema | Not started |
| Upload flow | Not started |
| Event creation | Not started |
| Gallery view | Not started |
| Offline queue | Not started |

## Build Order

1. Schema + file upload
2. Event creation
3. Guest flow (QR → camera → upload)
4. Gallery view
5. Public/private toggle
6. Offline queue (most complex, save for last)
