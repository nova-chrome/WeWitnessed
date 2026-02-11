import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Events from "./model/events";
import * as Guests from "./model/guests";

export const listByEvent = query({
  args: {
    eventId: v.id("events"),
    coupleSecret: v.string(),
  },
  returns: v.union(
    v.null(),
    v.array(
      v.object({
        _id: v.id("guests"),
        _creationTime: v.number(),
        eventId: v.id("events"),
        name: v.string(),
        deviceId: v.string(),
        createdAt: v.number(),
        photoCount: v.number(),
        latestPhotoAt: v.union(v.number(), v.null()),
      }),
    ),
  ),
  handler: async (ctx, { eventId, coupleSecret }) => {
    const isValid = await Events.verifyCoupleSecret(ctx, eventId, coupleSecret);
    if (!isValid) return null;
    return Guests.getGuestsWithPhotoCounts(ctx, eventId);
  },
});

export const getByDevice = query({
  args: {
    eventId: v.id("events"),
    deviceId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("guests"),
      _creationTime: v.number(),
      eventId: v.id("events"),
      name: v.string(),
      deviceId: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, { eventId, deviceId }) => {
    return Guests.getGuestByDevice(ctx, eventId, deviceId);
  },
});

export const getById = query({
  args: {
    guestId: v.id("guests"),
    eventId: v.id("events"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("guests"),
      name: v.string(),
    }),
  ),
  handler: async (ctx, { guestId, eventId }) => {
    const guest = await ctx.db.get(guestId);
    // Verify guest exists and belongs to the specified event
    if (!guest || guest.eventId !== eventId) return null;
    return { _id: guest._id, name: guest.name };
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    deviceId: v.string(),
  },
  returns: v.id("guests"),
  handler: async (ctx, { eventId, name, deviceId }) => {
    return Guests.createGuest(ctx, eventId, name, deviceId);
  },
});
