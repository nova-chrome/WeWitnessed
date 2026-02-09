# Feature Memory: Event Editing

## Goal

Implement event editing (post-MVP feature 1.1): let the couple edit event name and date after creation, from the gallery page via a dialog with a pre-filled form. Slug and secret cannot be changed.

## Key Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Events table: name, slug, date?, coupleSecret, createdAt. Indexed by slug. |
| `convex/events.ts` | Public API: `create`, `getBySlug`, `verifyCoupleSecret`. **Needs `update` mutation.** |
| `convex/model/events.ts` | Business logic: slug/secret generation, validation, verification. **Needs `updateEvent` helper.** |
| `src/features/events/components/event-create-form.tsx` | TanStack Form + Zod. Reuse validation schema for edit form. Has `EventCreateFormSchema` with name, date, slug, coupleSecret fields. |
| `src/features/events/hooks/use-couple-session.ts` | `useCoupleSession(slug, eventId)` -> `{ isCouple, coupleSecret, isLoading }`. Auth for couple actions. |
| `src/features/events/types/event.ts` | `CreateEventResult` interface. |
| `src/app/e/[slug]/_components/event-gallery-view.tsx` | Gallery page. **Edit button goes in header (couple view only).** Lines 98-101 = couple share button area, Lines 112-130 = header content area. |
| `src/features/events/components/event-share-dialog.tsx` | Existing dialog pattern to follow for edit dialog. |

## Decisions

1. **Edit via dialog, not separate page** - PRD says "open dialog with pre-filled form" from gallery header
2. **Only name and date are editable** - Slug and coupleSecret cannot change after creation (PRD acceptance criteria)
3. **Auth via coupleSecret** - Same pattern as photo visibility/delete. Mutation requires valid coupleSecret.
4. **Reuse validation from create form** - `EventCreateFormSchema` has the Zod validators. Extract name/date subset for edit.

## Current Status

- **Branch**: `feat/event-editing` (0 commits ahead of main, no uncommitted changes)
- **Nothing built yet** - Branch just created, no implementation started

## Implementation Plan

### Backend (Convex)

1. Add `updateEvent` helper in `convex/model/events.ts`:
   - Verify coupleSecret
   - Patch name and/or date on the event document
   
2. Add `update` mutation in `convex/events.ts`:
   - Args: `eventId`, `coupleSecret`, `name?`, `date?`
   - Returns: `null`
   - Validates coupleSecret, then calls `ctx.db.patch()`

### Frontend

3. Create `EventEditDialog` component in `src/features/events/components/event-edit-dialog.tsx`:
   - Dialog (shadcn) with TanStack Form
   - Pre-filled with current event name and date
   - Only shows name + date fields (no slug, no secret)
   - Zod validation (reuse/extract from create form)
   - Calls `api.events.update` mutation on submit
   - Closes dialog on success (Convex reactivity auto-updates gallery)

4. Add edit button to gallery header in `event-gallery-view.tsx`:
   - Couple-only (behind `couple.isCouple` check)
   - Small edit icon button near event name
   - Opens `EventEditDialog`

## Blockers

None identified. All dependencies exist:
- TanStack Form pattern established
- Couple auth (useCoupleSession) built
- Dialog components (shadcn) available
- Convex mutation pattern established

## Patterns to Follow

- **Mutation pattern**: See `convex/events.ts` `create` mutation - args validation, model layer call, return
- **Dialog pattern**: See `event-share-dialog.tsx` for how dialogs are structured
- **Form pattern**: See `event-create-form.tsx` for TanStack Form + Zod + Field components
- **Auth pattern**: coupleSecret passed to mutation, verified in handler via `Events.verifyCoupleSecret()`
- **Import style**: `~/components/ui/...`, `~/convex/_generated/api`, `~/features/.../...`
