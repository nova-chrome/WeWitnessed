import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function getGuestByDevice(
  ctx: QueryCtx,
  eventId: Id<"events">,
  deviceId: string,
) {
  return ctx.db
    .query("guests")
    .withIndex("by_event_device", (q) =>
      q.eq("eventId", eventId).eq("deviceId", deviceId),
    )
    .first();
}

export async function getGuestsByEvent(
  ctx: QueryCtx,
  eventId: Id<"events">,
) {
  return ctx.db
    .query("guests")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .order("desc")
    .collect();
}

export async function getGuestCount(
  ctx: QueryCtx,
  eventId: Id<"events">,
): Promise<number> {
  const guests = await ctx.db
    .query("guests")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();
  return guests.length;
}

export async function getGuestsWithPhotoCounts(
  ctx: QueryCtx,
  eventId: Id<"events">,
) {
  const [guests, photos] = await Promise.all([
    ctx.db
      .query("guests")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect(),
    ctx.db
      .query("photos")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect(),
  ]);

  // Group photos by guestId
  const photoCountByGuest = new Map<string, number>();
  const latestPhotoByGuest = new Map<string, number>();

  for (const photo of photos) {
    if (!photo.guestId) continue;
    const id = photo.guestId as string;
    photoCountByGuest.set(id, (photoCountByGuest.get(id) ?? 0) + 1);
    const current = latestPhotoByGuest.get(id) ?? 0;
    if (photo.createdAt > current) {
      latestPhotoByGuest.set(id, photo.createdAt);
    }
  }

  const enriched = guests.map((guest) => ({
    ...guest,
    photoCount: photoCountByGuest.get(guest._id as string) ?? 0,
    latestPhotoAt: latestPhotoByGuest.get(guest._id as string) ?? null,
  }));

  // Guests with photos first (most recent activity), then without (by join date)
  enriched.sort((a, b) => {
    if (a.latestPhotoAt && b.latestPhotoAt)
      return b.latestPhotoAt - a.latestPhotoAt;
    if (a.latestPhotoAt && !b.latestPhotoAt) return -1;
    if (!a.latestPhotoAt && b.latestPhotoAt) return 1;
    return b.createdAt - a.createdAt;
  });

  return enriched;
}

export async function createGuest(
  ctx: MutationCtx,
  eventId: Id<"events">,
  name: string,
  deviceId: string,
): Promise<Id<"guests">> {
  return ctx.db.insert("guests", {
    eventId,
    name,
    deviceId,
    createdAt: Date.now(),
  });
}
