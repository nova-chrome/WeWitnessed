'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CameraState, CameraControls, FacingMode, ZoomLevel } from '../types/camera';

export function useCamera(): CameraState & CameraControls & { videoRef: React.RefObject<HTMLVideoElement | null> } {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [state, setState] = useState<CameraState>({
    isReady: false,
    error: null,
    facingMode: 'environment',
    zoomLevel: 1,
    flashEnabled: false,
    isCapturing: false,
  });

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (facingMode: FacingMode) => {
    stopStream();

    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available. Please use HTTPS or localhost.');
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
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState(prev => ({ ...prev, isReady: true, facingMode, error: null }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isReady: false 
      }));
    }
  }, [stopStream]);

  const toggleCamera = useCallback(() => {
    const newFacingMode: FacingMode = state.facingMode === 'user' ? 'environment' : 'user';
    startCamera(newFacingMode);
  }, [state.facingMode, startCamera]);

  const setZoom = useCallback((level: ZoomLevel) => {
    setState(prev => ({ ...prev, zoomLevel: level }));
    
    // Apply zoom via CSS transform since browser zoom API has limited support
    if (videoRef.current) {
      const scale = level === 0.5 ? 0.5 : 1;
      videoRef.current.style.transform = `scale(${1 / scale})`;
    }
  }, []);

  const toggleFlash = useCallback(() => {
    setState(prev => ({ ...prev, flashEnabled: !prev.flashEnabled }));
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !state.isReady) return;

    setState(prev => ({ ...prev, isCapturing: true }));

    // Simulate capture (in real implementation, this would create a canvas snapshot)
    setTimeout(() => {
      setState(prev => ({ ...prev, isCapturing: false }));
    }, 300);
  }, [state.isReady]);

  // Initialize camera on mount
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (mounted) {
        await startCamera('environment');
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
