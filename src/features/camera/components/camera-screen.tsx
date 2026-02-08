"use client";

import { useCallback } from "react";
import { cn } from "~/lib/utils";
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
    facingMode,
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
    <div className="relative w-full h-svh bg-background overflow-hidden">
      {/* Full-screen Camera Preview */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full",
          facingMode === "user" && "-scale-x-100",
        )}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Flash Effect */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center px-6">
            <p className="text-foreground text-lg mb-2">Camera Access Required</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Upload overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 animate-spin rounded-full border-3 border-foreground border-t-transparent" />
            <span className="text-sm font-medium text-foreground">
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

      {/* Bottom Controls Area */}
      <div className="absolute bottom-0 left-0 right-0 h-44">
        {isReady && !error && (
          <CameraControls onCapture={handleCapture} isCapturing={isCapturing} />
        )}
      </div>
    </div>
  );
}
