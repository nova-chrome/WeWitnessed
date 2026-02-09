import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Events from "./model/events";
import * as Photos from "./model/photos";

export const create = mutation({
  args: {
    name: v.string(),
    date: v.optional(v.number()),
    slug: v.optional(v.string()),
    coupleSecret: v.optional(v.string()),
  },
  returns: v.object({
    id: v.id("events"),
    slug: v.string(),
    coupleSecret: v.string(),
  }),
  handler: async (ctx, args) => {
    const slug = await Events.resolveSlug(ctx, args.slug);
    const coupleSecret = Events.resolveCoupleSecret(args.coupleSecret);

    const id = await ctx.db.insert("events", {
      name: args.name,
      slug,
      date: args.date,
      coupleSecret,
      createdAt: Date.now(),
    });

    return { id, slug, coupleSecret };
  },
});

export const verifyCoupleSecret = query({
  args: {
    eventId: v.id("events"),
    coupleSecret: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, { eventId, coupleSecret }) => {
    return Events.verifyCoupleSecret(ctx, eventId, coupleSecret);
  },
});

export const update = mutation({
  args: {
    eventId: v.id("events"),
    coupleSecret: v.string(),
    name: v.optional(v.string()),
    date: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, { eventId, coupleSecret, name, date }) => {
    await Events.updateEvent(ctx, eventId, coupleSecret, { name, date });
    return null;
  },
});

export const remove = mutation({
  args: {
    eventId: v.id("events"),
    coupleSecret: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { eventId, coupleSecret }) => {
    await Events.deleteEvent(ctx, eventId, coupleSecret);
    return null;
  },
});

export const setCoverPhoto = mutation({
  args: {
    eventId: v.id("events"),
    coupleSecret: v.string(),
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, { eventId, coupleSecret, storageId }) => {
    await Events.setCoverPhoto(ctx, eventId, coupleSecret, storageId);
    return null;
  },
});

export const removeCoverPhoto = mutation({
  args: {
    eventId: v.id("events"),
    coupleSecret: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { eventId, coupleSecret }) => {
    await Events.removeCoverPhoto(ctx, eventId, coupleSecret);
    return null;
  },
});

export const getOgData = query({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      name: v.string(),
      date: v.optional(v.number()),
      photoCount: v.number(),
      coverPhotoUrl: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx, { slug }) => {
    const event = await Events.getEventBySlug(ctx, slug);
    if (!event) return null;

    const [photoCount, fallbackPhotoUrl] = await Promise.all([
      Photos.getPublicPhotoCount(ctx, event._id),
      Photos.getLatestPublicPhotoUrl(ctx, event._id),
    ]);

    const coverPhotoUrl = event.coverPhotoStorageId
      ? await ctx.storage.getUrl(event.coverPhotoStorageId)
      : fallbackPhotoUrl;

    return {
      name: event.name,
      date: event.date,
      photoCount,
      coverPhotoUrl,
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      date: v.optional(v.number()),
      coverPhotoUrl: v.union(v.string(), v.null()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, { slug }) => {
    const event = await Events.getEventBySlug(ctx, slug);
    if (!event) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { coverPhotoStorageId, coupleSecret, ...publicEvent } = event;
    const coverPhotoUrl = coverPhotoStorageId
      ? await ctx.storage.getUrl(coverPhotoStorageId)
      : null;
    return { ...publicEvent, coverPhotoUrl };
  },
});
