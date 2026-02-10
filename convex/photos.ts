import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Events from "./model/events";
import * as Guests from "./model/guests";
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
      caption: v.optional(v.string()),
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

export const remove = mutation({
  args: {
    photoId: v.id("photos"),
    eventId: v.id("events"),
    coupleSecret: v.optional(v.string()),
    deviceId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { photoId, eventId, coupleSecret, deviceId }) => {
    // Couple can delete any photo in the event
    if (coupleSecret) {
      const isCouple = await Events.verifyCoupleSecret(
        ctx,
        eventId,
        coupleSecret,
      );
      if (isCouple) {
        await Photos.deletePhoto(ctx, photoId, eventId);
        return null;
      }
    }

    // Guest can delete only their own photos
    if (deviceId) {
      const guest = await Guests.getGuestByDevice(ctx, eventId, deviceId);
      if (!guest) {
        throw new ConvexError({
          code: "Forbidden",
          message: "Guest not found for this device",
        });
      }

      const photo = await ctx.db.get(photoId);
      if (!photo) {
        throw new ConvexError({
          code: "NotFound",
          message: "Photo not found",
        });
      }
      if (photo.guestId !== guest._id) {
        throw new ConvexError({
          code: "Forbidden",
          message: "You can only delete your own photos",
        });
      }

      await Photos.deletePhoto(ctx, photoId, eventId);
      return null;
    }

    throw new ConvexError({
      code: "Forbidden",
      message: "No valid credentials provided",
    });
  },
});

export const updateCaption = mutation({
  args: {
    photoId: v.id("photos"),
    eventId: v.id("events"),
    deviceId: v.string(),
    caption: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { photoId, eventId, deviceId, caption }) => {
    const guest = await Guests.getGuestByDevice(ctx, eventId, deviceId);
    if (!guest) {
      throw new ConvexError({
        code: "Forbidden",
        message: "Guest not found for this device",
      });
    }

    const photo = await ctx.db.get(photoId);
    if (!photo) {
      throw new ConvexError({
        code: "NotFound",
        message: "Photo not found",
      });
    }
    if (photo.guestId !== guest._id) {
      throw new ConvexError({
        code: "Forbidden",
        message: "You can only caption your own photos",
      });
    }

    if (caption && caption.length > 200) {
      throw new ConvexError({
        code: "BadRequest",
        message: "Caption must be 200 characters or less",
      });
    }

    await Photos.updatePhotoCaption(ctx, photoId, caption);
    return null;
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
