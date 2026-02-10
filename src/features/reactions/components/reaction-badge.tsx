import { cn } from "~/lib/utils";

interface ReactionBadgeProps {
  total: number;
  className?: string;
}

export function ReactionBadge({ total, className }: ReactionBadgeProps) {
  if (total <= 0) return null;

  return (
    <span
      className={cn(
        "absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-black/50 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm pointer-events-none",
        className,
      )}
    >
      <span className="leading-none">{"\u2764\uFE0F"}</span>
      <span className="tabular-nums">{total}</span>
    </span>
  );
}
