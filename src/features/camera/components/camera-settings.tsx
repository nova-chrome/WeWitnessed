'use client';

import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';
import Link from 'next/link';
import type { ZoomLevel } from '../types/camera';

interface CameraSettingsProps {
  backHref?: string;
  zoomLevel: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
  onToggleCamera: () => void;
}

export function CameraSettings({
  backHref,
  zoomLevel,
  onZoomChange,
  onToggleCamera,
}: CameraSettingsProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-5 pt-safe-or-4">
      {/* Back Button */}
      {backHref ? (
        <Link
          href={backHref}
          className="flex items-center justify-center size-10 rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-black/60 active:scale-95"
          aria-label="Back to gallery"
        >
          <ArrowLeftIcon className="size-5 text-white" />
        </Link>
      ) : (
        <div className="size-10" />
      )}

      {/* Zoom Controls - Darker container */}
      <div className="flex items-center gap-0 bg-black/60 backdrop-blur-md rounded-full p-1">
        <button
          onClick={() => onZoomChange(0.5)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            zoomLevel === 0.5
              ? 'bg-black/80 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          0.5
        </button>
        <button
          onClick={() => onZoomChange(1)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            zoomLevel === 1
              ? 'bg-black/80 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          1x
        </button>
      </div>

      {/* Flip Camera */}
      <button
        onClick={onToggleCamera}
        className="flex items-center justify-center size-10 rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-black/60 active:scale-95"
        aria-label="Switch camera"
      >
        <RefreshCwIcon className="size-5 text-white" />
      </button>
    </div>
  );
}
