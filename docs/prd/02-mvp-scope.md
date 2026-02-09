# MVP Scope

## Target Date

Mid-May 2025 (cousin's wedding)

## Must Have

| Feature | Description | Status |
|---------|-------------|--------|
| Event creation | Couple creates event with name, optional date, custom slug, custom secret. Gets QR code + shareable links | Done |
| Guest upload | Full-screen camera capture (front/back, zoom, flash) → upload to Convex storage | Done |
| Gallery view | Grid/list toggle, photo lightbox with navigation, download, delete | Done |
| Public/private toggle | Per-photo visibility control (couple only), dimmed UI for private photos | Done |
| Couple auth | URL-based secret (`?s=`), verified against Convex, persisted in localStorage | Done |
| Guest identity | Device ID tracking, optional name prompt on first upload, returning guest detection | Done |
| Photo deletion | Couple can delete any photo, guests can delete their own. Confirmation dialog | Done |
| PWA | Installable via manifest + service worker shell | Done |
| Theme | Dark/light/system toggle via next-themes | Done |

## Nice to Have (from original plan)

| Feature | Description | Status |
|---------|-------------|--------|
| Guest name | Optional "who took this?" field | Done |
| Download all | Couple can download zip of photos | Not built |
| Offline queue | Store locally in IndexedDB, sync when online | Not built (ADR accepted, not implemented) |

## Out of Scope (deferred to post-MVP)

- Video capture/upload
- User accounts (couple or guest)
- AI features (tagging, storytelling)
- Photo editing / filters
- Comments / reactions
- Multiple events per couple
- Payment / monetization
- Event editing after creation
- Event deletion

## Build Order (completed)

1. ~~Schema + file upload~~ — Done
2. ~~Event creation~~ — Done
3. ~~Guest flow (QR → camera → upload)~~ — Done
4. ~~Gallery view~~ — Done
5. ~~Public/private toggle~~ — Done
6. Offline queue — Deferred (see [ADR 002](../decisions/002-offline-queue.md))
