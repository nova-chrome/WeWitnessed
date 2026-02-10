import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    slug: v.string(),
    date: v.optional(v.number()),
    coupleSecret: v.string(),
    coverPhotoStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  guests: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    deviceId: v.string(),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_device", ["eventId", "deviceId"]),

  photos: defineTable({
    eventId: v.id("events"),
    guestId: v.optional(v.id("guests")),
    storageId: v.id("_storage"),
    isPublic: v.boolean(),
    caption: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_public", ["eventId", "isPublic"])
    .index("by_guest", ["guestId"]),
});
