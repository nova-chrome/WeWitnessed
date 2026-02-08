"use client";

import { format } from "date-fns";
import { ImageIcon, SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CameraControlsProps {
  onCapture: () => void | Promise<void>;
  isCapturing: boolean;
}

export function CameraControls({
  onCapture,
  isCapturing,
}: CameraControlsProps) {
  const [currentTime, setCurrentTime] = useState(() =>
    format(new Date(), "h:mm a"),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(new Date(), "h:mm a"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center pb-safe-or-6">
      {/* Time Display */}
      <div className="mb-6 text-white text-4xl font-light tabular-nums">
        {currentTime}
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between w-full px-8">
        {/* Settings */}
        <button
          className="flex items-center justify-center size-12 rounded-full transition-all hover:bg-white/10 active:scale-95"
          aria-label="Settings"
        >
          <SettingsIcon className="size-6 text-white" />
        </button>

        {/* Capture Button */}
        <button
          onClick={onCapture}
          disabled={isCapturing}
          className="relative flex items-center justify-center size-20 rounded-full transition-all active:scale-95 disabled:opacity-50"
          aria-label="Capture photo"
        >
          {/* Outer ring with purple gradient */}
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500 to-purple-600 p-1">
            <div className="size-full rounded-full bg-[#0a0a0a]" />
          </div>

          {/* Inner white button */}
          <div className="relative size-[68px] rounded-full bg-white transition-transform hover:scale-95" />
        </button>

        {/* Gallery */}
        <button
          className="flex items-center justify-center size-12 rounded-full border-2 border-white/30 transition-all hover:bg-white/10 active:scale-95 overflow-hidden"
          aria-label="Open gallery"
        >
          <ImageIcon className="size-6 text-white" />
        </button>
      </div>
    </div>
  );
}
