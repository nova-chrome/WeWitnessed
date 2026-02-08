"use client";

import { useCallback } from "react";
import { useCamera } from "../hooks/use-camera";
import { CameraControls } from "./camera-controls";
import { CameraSettings } from "./camera-settings";

interface CameraScreenProps {
  backHref?: string;
  isUploading?: boolean;
  onPhotoCaptured?: (blob: Blob) => void;
}

export function CameraScreen({
  backHref,
  isUploading,
  onPhotoCaptured,
}: CameraScreenProps) {
  const {
    videoRef,
    isReady,
    error,
    zoomLevel,
    isCapturing,
    toggleCamera,
    setZoom,
    capture,
  } = useCamera();

  const handleCapture = useCallback(async () => {
    const blob = await capture();
    if (blob && onPhotoCaptured) {
      onPhotoCaptured(blob);
    }
  }, [capture, onPhotoCaptured]);

  return (
    <div className="relative w-full h-svh bg-[#0a0a0a] overflow-hidden flex flex-col">
      {/* Camera Viewfinder Container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Camera Preview with rounded corners */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover rounded-b-[32px]"
        />

        {/* Flash Effect */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white animate-flash pointer-events-none rounded-b-[32px]" />
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-b-[32px]">
            <div className="text-center px-6">
              <p className="text-white text-lg mb-2">Camera Access Required</p>
              <p className="text-white/60 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black rounded-b-[32px]">
            <div className="flex flex-col items-center gap-4">
              <div className="size-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 text-sm">Initializing camera...</p>
            </div>
          </div>
        )}

        {/* Upload overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-b-[32px]">
            <div className="flex flex-col items-center gap-3">
              <div className="size-10 animate-spin rounded-full border-3 border-white border-t-transparent" />
              <span className="text-sm font-medium text-white">
                Uploading...
              </span>
            </div>
          </div>
        )}

        {/* Top Camera Settings */}
        {isReady && !error && (
          <CameraSettings
            backHref={backHref}
            zoomLevel={zoomLevel}
            onZoomChange={setZoom}
            onToggleCamera={toggleCamera}
          />
        )}
      </div>

      {/* Bottom Controls Area - Dark background */}
      <div className="relative h-44 bg-[#0a0a0a]">
        {isReady && !error && (
          <CameraControls onCapture={handleCapture} isCapturing={isCapturing} />
        )}
      </div>
    </div>
  );
}
