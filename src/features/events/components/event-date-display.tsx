"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  getEventPhase,
  calculateCountdown,
} from "~/features/events/utils/countdown";

interface EventDateDisplayProps {
  /**
   * Event date as milliseconds timestamp (optional)
   */
  date?: number;
}

export function EventDateDisplay({ date }: EventDateDisplayProps) {
  if (!date) return null;

  const eventDate = new Date(date);
  const phase = getEventPhase(eventDate);
  const [countdown, setCountdown] = useState<string>(() =>
    calculateCountdown(eventDate),
  );

  // Update countdown every second for upcoming events
  useEffect(() => {
    if (phase !== "upcoming") return;

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(eventDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [date, phase]);

  switch (phase) {
    case "upcoming":
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs tracking-wide">
          <CalendarIcon className="size-3" />
          <span>Event starts in {countdown}</span>
        </div>
      );
    case "today":
      return (
        <div className="flex items-center gap-1.5 text-purple-400 text-xs tracking-wide">
          <CalendarIcon className="size-3 animate-pulse" />
          <span>Event today!</span>
        </div>
      );
    case "past":
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground/60 text-xs tracking-wide">
          <CalendarIcon className="size-3" />
          <span>{format(eventDate, "PPP")}</span>
        </div>
      );
    default:
      return null;
  }
}
