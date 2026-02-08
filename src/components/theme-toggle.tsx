"use client";

import { MonitorIcon, MoonIcon, SunIcon, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "~/lib/utils";

// NOTE: This is a workaround to avoid hydration errors.
const emptySubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

type Theme = "light" | "dark" | "system";
const themes: Theme[] = ["light", "dark", "system"];
const icons: Record<Theme, LucideIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getTrue, getFalse);
  const Icon = mounted ? (icons[theme as Theme] ?? SunIcon) : MonitorIcon;

  function cycle() {
    const current = themes.indexOf(theme as Theme);
    const next = themes[(current + 1) % themes.length];
    setTheme(next);
  }

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
