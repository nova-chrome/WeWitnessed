import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import { EventGalleryView } from "./_components/event-gallery-view";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchQuery(api.events.getOgData, { slug });

  if (!event) {
    return {
      title: "Event Not Found | WeWitnessed",
      description:
        "This event could not be found. Check the link and try again.",
    };
  }

  const photoLabel =
    event.photoCount === 1 ? "1 photo" : `${event.photoCount} photos`;
  const description =
    event.photoCount > 0
      ? `${photoLabel} captured at ${event.name} — WeWitnessed`
      : `Capture and share moments from ${event.name} — WeWitnessed`;

  return {
    title: `${event.name} | WeWitnessed`,
    description,
    openGraph: {
      title: event.name,
      description,
      siteName: "WeWitnessed",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  return <EventGalleryView slug={slug} />;
}
