"use client";

import { XIcon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "~/components/ui/button";
import { tryCatch } from "~/utils/try-catch";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface EventInstallPromptProps {
  eventName: string;
}

const getIsIOS = () =>
  typeof window !== "undefined"
    ? /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    : false;

const getIsStandalone = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(display-mode: standalone)").matches
    : false;

export function EventInstallPrompt({ eventName }: EventInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const isIOS = useSyncExternalStore(
    () => () => {},
    getIsIOS,
    () => false,
  );

  const isStandalone = useSyncExternalStore(
    () => () => {},
    getIsStandalone,
    () => false,
  );

  const [isDismissed, setIsDismissed] = useState(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem(`install-dismissed-${eventName}`) === "true"
      : false,
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { data: choice, error } = await tryCatch(deferredPrompt.userChoice);

    if (error) {
      console.error("Install prompt failed:", error);
      setDeferredPrompt(null);
      return;
    }

    if (choice.outcome === "accepted") {
      console.log("User accepted the install prompt");
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`install-dismissed-${eventName}`, "true");
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-sm font-semibold">Install {eventName}</h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            Install this event as an app for quick access and offline viewing.
          </p>
          <Button onClick={handleInstallClick} size="sm" className="w-full">
            Install App
          </Button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-sm font-semibold">Install {eventName}</h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Install this event as an app for quick access:
          </p>
          <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>Tap the Share button (square with arrow)</li>
            <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
            <li>Tap &quot;Add&quot; to confirm</li>
          </ol>
        </div>
      </div>
    );
  }

  return null;
}
