import { EventGalleryView } from "~/features/events/components/event-gallery-view";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  return <EventGalleryView slug={slug} />;
}
