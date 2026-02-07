'use client';

import { useEffect, useState } from 'react';
import { SettingsIcon, ImageIcon } from 'lucide-react';

interface CameraControlsProps {
  onCapture: () => void | Promise<void>;
  isCapturing: boolean;
}

export function CameraControls({ onCapture, isCapturing }: CameraControlsProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours} ${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center pb-safe-or-6">
      {/* Time Display - Individual digits with spacing */}
      <div className="flex justify-center items-center gap-1 mb-6">
        {currentTime.split(' ').map((num, i) => (
          <span key={i} className="flex items-center gap-1">
            {num.split('').map((digit, j) => (
              <span
                key={j}
                className={`text-white text-2xl font-light tabular-nums ${
                  i === 1 && j === 0 ? 'text-white' : 'text-white/60'
                }`}
              >
                {digit}
              </span>
            ))}
          </span>
        ))}
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
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-1">
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
