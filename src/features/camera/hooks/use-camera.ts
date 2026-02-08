"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tryCatch } from "~/utils/try-catch";
import type {
  CameraControls,
  CameraState,
  FacingMode,
  ZoomLevel,
} from "../types/camera";

type Camera = CameraState &
  CameraControls & { videoRef: React.RefObject<HTMLVideoElement | null> };

/**
 * Initializes camera stream with specified constraints
 * @param facingMode - Camera facing mode (user or environment)
 * @param videoElement - Video element to attach stream to
 * @returns MediaStream and facing mode on success
 */
async function initializeCameraStream(
  facingMode: FacingMode,
  videoElement: HTMLVideoElement | null,
): Promise<{ stream: MediaStream; facingMode: FacingMode }> {
  // Check if mediaDevices API is available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Camera API not available. Please use HTTPS or localhost.",
    );
  }

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  if (videoElement) {
    videoElement.srcObject = stream;
    await videoElement.play();
  }

  return { stream, facingMode };
}

export function useCamera(): Camera {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>({
    isReady: false,
    error: null,
    facingMode: "environment",
    zoomLevel: 1,
    flashEnabled: false,
    isCapturing: false,
  });

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (facingMode: FacingMode) => {
      stopStream();

      const { data, error } = await tryCatch(
        initializeCameraStream(facingMode, videoRef.current),
      );

      if (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to access camera";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isReady: false,
        }));
        return;
      }

      streamRef.current = data.stream;

      setState((prev) => ({
        ...prev,
        isReady: true,
        facingMode: data.facingMode,
        error: null,
      }));
    },
    [stopStream],
  );

  const toggleCamera = useCallback(() => {
    const newFacingMode: FacingMode =
      state.facingMode === "user" ? "environment" : "user";
    startCamera(newFacingMode);
  }, [state.facingMode, startCamera]);

  const setZoom = useCallback((level: ZoomLevel) => {
    setState((prev) => ({ ...prev, zoomLevel: level }));

    // Apply zoom via CSS transform since browser zoom API has limited support
    if (videoRef.current) {
      const scale = level === 0.5 ? 0.5 : 1;
      videoRef.current.style.transform = `scale(${1 / scale})`;
    }
  }, []);

  const toggleFlash = useCallback(() => {
    setState((prev) => ({ ...prev, flashEnabled: !prev.flashEnabled }));
  }, []);

  const capture = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || !state.isReady) return null;

    setState((prev) => ({ ...prev, isCapturing: true }));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setState((prev) => ({ ...prev, isCapturing: false }));
      return null;
    }

    // Mirror the captured image for front camera to match the preview
    if (state.facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85);
    });

    // Brief flash animation delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    setState((prev) => ({ ...prev, isCapturing: false }));

    return blob;
  }, [state.isReady, state.facingMode]);

  // Initialize camera on mount
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (mounted) {
        await startCamera("environment");
      }
    };

    initCamera();

    return () => {
      mounted = false;
      stopStream();
    };
  }, [startCamera, stopStream]);

  return {
    ...state,
    videoRef,
    toggleCamera,
    setZoom,
    toggleFlash,
    capture,
  };
}
