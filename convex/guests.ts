import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Guests from "./model/guests";

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
