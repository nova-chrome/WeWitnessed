import { differenceInSeconds, isBefore, isSameDay } from "date-fns";

export type EventPhase = "upcoming" | "today" | "past";

/**
 * Determines the phase of an event based on its date
 */
export function getEventPhase(eventDate: Date): EventPhase {
  const now = new Date();

  if (isSameDay(eventDate, now)) return "today";
  if (isBefore(eventDate, now)) return "past";
  return "upcoming";
}

/**
 * Calculates a formatted countdown string for an upcoming event
 * @returns Formatted string like "2d 14h 32m" or "14h 32m" or "32m"
 */
export function calculateCountdown(eventDate: Date): string {
  const now = new Date();
  const totalSeconds = differenceInSeconds(eventDate, now);

  if (totalSeconds <= 0) return "0m";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let result = "";
  if (days > 0) result += `${days}d `;
  if (days > 0 || hours > 0) result += `${hours}h `;
  result += `${minutes}m`;
  return result.trim();
}
