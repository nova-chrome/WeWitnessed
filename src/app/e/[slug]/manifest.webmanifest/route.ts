import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { api } from "~/convex/_generated/api";
import { tryCatch } from "~/utils/try-catch";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  // Fetch event data from Convex
  const { data: event, error } = await tryCatch(
    fetchQuery(api.events.getBySlug, { slug }),
  );

  // Handle errors or not found
  if (error) {
    return new NextResponse("Failed to fetch event", { status: 500 });
  }

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  // Generate event-specific manifest
  const manifest = {
    name: `${event.name} - WeWitnessed`,
    short_name: event.name,
    description: `Share photos from ${event.name}`,
    start_url: `/e/${slug}`,
    scope: `/e/${slug}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
      {
        src: "/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
