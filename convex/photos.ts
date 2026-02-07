import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Photos from "./model/photos";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    guestId: v.optional(v.id("guests")),
    storageId: v.id("_storage"),
  },
  returns: v.id("photos"),
  handler: async (ctx, args) => {
    return Photos.createPhoto(ctx, args);
  },
});

export const getByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  returns: v.array(
    v.object({
      _id: v.id("photos"),
      _creationTime: v.number(),
      eventId: v.id("events"),
      guestId: v.optional(v.id("guests")),
      storageId: v.id("_storage"),
      isPublic: v.boolean(),
      createdAt: v.number(),
      url: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx, { eventId }) => {
    return Photos.getEventPhotos(ctx, eventId);
  },
});
