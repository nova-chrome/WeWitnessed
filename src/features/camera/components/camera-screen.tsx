"use client";

import { CameraIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useCamera } from "../hooks/use-camera";
import {
  getDeviceInstructions,
  queryCameraPermission,
} from "../utils/camera-permissions";
import { CameraControls } from "./camera-controls";
import { CameraSettings } from "./camera-settings";

interface CameraScreenProps {
  backHref?: string;
  galleryHref?: string;
  onPhotoCaptured?: (blob: Blob) => void;
  sessionCount?: number;
  lastThumbnailUrl?: string | null;
  hasActiveUploads?: boolean;
}

export function CameraScreen({
  backHref,
  galleryHref,
  onPhotoCaptured,
  sessionCount = 0,
  lastThumbnailUrl,
  hasActiveUploads,
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
    retryCamera,
  } = useCamera();

  const [permissionState, setPermissionState] =
    useState<PermissionState | null>(null);

  useEffect(() => {
    if (!error) return;
    queryCameraPermission().then(setPermissionState);
  }, [error]);

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
          <div className="flex flex-col items-center gap-4 px-8 max-w-sm text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <CameraIcon className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-foreground text-lg font-medium">
                Camera Access Required
              </p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
            {permissionState === "denied" && (
              <p className="text-muted-foreground text-sm rounded-lg bg-muted px-4 py-3">
                {getDeviceInstructions().steps}
              </p>
            )}
            <Button
              variant="default"
              size="lg"
              onClick={() => retryCamera("environment")}
            >
              Try Again
            </Button>
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

      {/* Top Camera Settings */}
      {isReady && !error && (
        <CameraSettings
          backHref={backHref}
          zoomLevel={zoomLevel}
          onZoomChange={setZoom}
          onToggleCamera={toggleCamera}
          sessionCount={sessionCount}
          hasActiveUploads={hasActiveUploads}
        />
      )}

      {/* Bottom Controls Area */}
      <div className="absolute bottom-0 left-0 right-0 h-44">
        {isReady && !error && (
          <CameraControls
            onCapture={handleCapture}
            isCapturing={isCapturing}
            galleryHref={galleryHref ?? backHref}
            lastThumbnailUrl={lastThumbnailUrl}
          />
        )}
      </div>
    </div>
  );
}
