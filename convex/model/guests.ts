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
