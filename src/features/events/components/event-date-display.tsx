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
  // Initialize state and effects before any conditional returns
  const eventDate = date ? new Date(date) : null;
  const phase = eventDate ? getEventPhase(eventDate) : null;
  const [countdown, setCountdown] = useState<string>(() =>
    eventDate ? calculateCountdown(eventDate) : "",
  );

  // Update countdown every second for upcoming events
  useEffect(() => {
    if (!eventDate || phase !== "upcoming") return;

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(eventDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDate, phase]);

  if (!date || !eventDate) return null;

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
