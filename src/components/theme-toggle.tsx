"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "~/lib/utils";

const themes = ["light", "dark", "system"] as const;
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  function cycle() {
    const current = themes.indexOf(theme as (typeof themes)[number]);
    const next = themes[(current + 1) % themes.length];
    setTheme(next);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center size-8 rounded-full",
          "text-muted-foreground hover:text-foreground transition-colors",
          className,
        )}
        aria-label="Toggle theme"
      >
        <SunIcon className="size-4" />
      </button>
    );
  }

  const Icon =
    theme === "dark" ? MoonIcon : theme === "light" ? SunIcon : MonitorIcon;

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        "inline-flex items-center justify-center size-8 rounded-full",
        "text-muted-foreground hover:text-foreground transition-colors",
        className,
      )}
      aria-label="Toggle theme"
    >
      <Icon className="size-4" />
    </button>
  );
}
