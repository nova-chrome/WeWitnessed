import { EventCameraView } from "./_components/event-camera-view";

interface CameraPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CameraPage({ params }: CameraPageProps) {
  const { slug } = await params;

  return <EventCameraView slug={slug} />;
}
