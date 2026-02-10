'use client';

import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '~/lib/utils';
import type { ZoomLevel } from '../types/camera';

interface CameraSettingsProps {
  backHref?: string;
  zoomLevel: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
  onToggleCamera: () => void;
  sessionCount?: number;
  hasActiveUploads?: boolean;
}

export function CameraSettings({
  backHref,
  zoomLevel,
  onZoomChange,
  onToggleCamera,
  sessionCount = 0,
  hasActiveUploads,
}: CameraSettingsProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-5 pt-safe-or-4">
      {/* Back Button */}
      {backHref ? (
        <Link
          href={backHref}
          className="flex items-center justify-center size-10 rounded-full bg-background/50 backdrop-blur-md transition-all hover:bg-background/60 active:scale-95"
          aria-label="Back to gallery"
        >
          <ArrowLeftIcon className="size-5 text-foreground" />
        </Link>
      ) : (
        <div className="size-10" />
      )}

      {/* Zoom Controls + Session Counter */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-0 bg-background/60 backdrop-blur-md rounded-full p-1">
          <button
            onClick={() => onZoomChange(0.5)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              zoomLevel === 0.5
                ? 'bg-background/80 text-foreground'
                : 'text-foreground/70 hover:text-foreground',
            )}
          >
            0.5
          </button>
          <button
            onClick={() => onZoomChange(1)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              zoomLevel === 1
                ? 'bg-background/80 text-foreground'
                : 'text-foreground/70 hover:text-foreground',
            )}
          >
            1x
          </button>
        </div>

        {sessionCount > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-background/60 px-3 py-1 backdrop-blur-md">
            {hasActiveUploads && (
              <div className="size-3 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            )}
            <span className="text-xs font-medium text-foreground tabular-nums">
              {sessionCount} {sessionCount === 1 ? 'photo' : 'photos'}
            </span>
          </div>
        )}
      </div>

      {/* Flip Camera */}
      <button
        onClick={onToggleCamera}
        className="flex items-center justify-center size-10 rounded-full bg-background/50 backdrop-blur-md transition-all hover:bg-background/60 active:scale-95"
        aria-label="Switch camera"
      >
        <RefreshCwIcon className="size-5 text-foreground" />
      </button>
    </div>
  );
}
