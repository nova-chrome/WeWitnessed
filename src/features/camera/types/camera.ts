export type ZoomLevel = 0.5 | 1;

export type FlashMode = 'off' | 'on' | 'auto';

export type FacingMode = 'user' | 'environment';

export interface CameraState {
  isReady: boolean;
  error: string | null;
  facingMode: FacingMode;
  zoomLevel: ZoomLevel;
  flashEnabled: boolean;
  isCapturing: boolean;
}

export interface CameraControls {
  toggleCamera: () => void;
  setZoom: (level: ZoomLevel) => void;
  toggleFlash: () => void;
  capture: () => Promise<Blob | null>;
  retryCamera: (facingMode: FacingMode) => void;
}
