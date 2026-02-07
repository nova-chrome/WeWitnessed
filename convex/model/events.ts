import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => SLUG_CHARS[byte % SLUG_CHARS.length]).join(
    "",
  );
}

export async function generateUniqueSlug(ctx: MutationCtx): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const slug = generateRandomString(10);
    const existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!existing) return slug;
  }
  throw new ConvexError({
    code: "Internal",
    message: "Failed to generate unique slug",
  });
}

export function generateCoupleSecret(): string {
  return generateRandomString(32);
}

export async function getEventBySlug(ctx: QueryCtx, slug: string) {
  return ctx.db
    .query("events")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
}
