import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Events from "./model/events";

export const create = mutation({
  args: {
    name: v.string(),
    date: v.optional(v.number()),
  },
  returns: v.object({
    id: v.id("events"),
    slug: v.string(),
    coupleSecret: v.string(),
  }),
  handler: async (ctx, args) => {
    const slug = await Events.generateUniqueSlug(ctx);
    const coupleSecret = Events.generateCoupleSecret();

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
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, { slug }) => {
    const event = await Events.getEventBySlug(ctx, slug);
    if (!event) return null;
    const { coupleSecret: _, ...publicEvent } = event;
    return publicEvent;
  },
});
