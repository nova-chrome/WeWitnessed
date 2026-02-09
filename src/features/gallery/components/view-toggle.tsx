"use client";

import { LayoutGridIcon, ListIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export type ViewMode = "grid" | "list";

const icons = {
  grid: LayoutGridIcon,
  list: ListIcon,
} as const;

interface ViewToggleProps {
  viewMode: ViewMode;
  onToggle: () => void;
  className?: string;
}

export function ViewToggle({ viewMode, onToggle, className }: ViewToggleProps) {
  const Icon = icons[viewMode];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center justify-center size-8 rounded-full",
        "text-muted-foreground hover:text-foreground transition-colors",
        className,
      )}
      aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
    >
      <Icon className="size-4" />
    </button>
  );
}
