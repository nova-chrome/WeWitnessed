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
      }),
    ),
  ),
  handler: async (ctx, { eventId, coupleSecret }) => {
    const isValid = await Events.verifyCoupleSecret(ctx, eventId, coupleSecret);
    if (!isValid) return null;
    return Guests.getGuestsByEvent(ctx, eventId);
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
