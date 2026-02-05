import { CameraScreen } from '~/features/camera/components/camera-screen';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Camera - WeWitnessed',
  description: 'Capture wedding memories',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function CameraPage() {
  return <CameraScreen />;
}
