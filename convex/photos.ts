import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Events from "./model/events";
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
    coupleSecret: v.optional(v.string()),
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
  handler: async (ctx, { eventId, coupleSecret }) => {
    if (coupleSecret) {
      const isCouple = await Events.verifyCoupleSecret(
        ctx,
        eventId,
        coupleSecret,
      );
      if (isCouple) {
        return Photos.getEventPhotos(ctx, eventId);
      }
    }
    return Photos.getPublicEventPhotos(ctx, eventId);
  },
});

export const toggleVisibility = mutation({
  args: {
    photoId: v.id("photos"),
    eventId: v.id("events"),
    coupleSecret: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, { photoId, eventId, coupleSecret }) => {
    const isCouple = await Events.verifyCoupleSecret(
      ctx,
      eventId,
      coupleSecret,
    );
    if (!isCouple) {
      throw new ConvexError({
        code: "Forbidden",
        message: "Invalid couple secret",
      });
    }
    return Photos.togglePhotoVisibility(ctx, photoId);
  },
});
