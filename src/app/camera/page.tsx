import { CameraScreen } from '~/features/camera/components/camera-screen';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Camera - WeWitnessed',
  description: 'Capture wedding memories',
};

export default function CameraPage() {
  return <CameraScreen />;
}
