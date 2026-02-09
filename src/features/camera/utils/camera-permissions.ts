import { tryCatch } from "~/utils/try-catch";

interface DeviceInstructions {
  platform: string;
  steps: string;
}

export function getDeviceInstructions(): DeviceInstructions {
  const ua = navigator.userAgent;

  // iOS detection (includes iPadOS with "Macintosh" + touch)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    if (/CriOS/.test(ua)) {
      return {
        platform: "iOS Chrome",
        steps: "Open Settings > Chrome > Camera and make sure it's enabled.",
      };
    }
    return {
      platform: "iOS Safari",
      steps: "Open Settings > Safari > Camera and set it to Allow.",
    };
  }

  if (/Android/.test(ua)) {
    return {
      platform: "Android",
      steps: "Open Settings > Apps > Browser > Permissions > Camera and allow access.",
    };
  }

  // Desktop browsers
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    return {
      platform: "Safari",
      steps: "Go to Safari > Settings > Websites > Camera and allow this site.",
    };
  }

  if (/Firefox/.test(ua)) {
    return {
      platform: "Firefox",
      steps: "Click the lock icon in the address bar, then allow camera access.",
    };
  }

  // Chrome, Edge, and other Chromium-based browsers
  return {
    platform: "Browser",
    steps: "Click the lock icon in the address bar, then allow camera access.",
  };
}

export async function queryCameraPermission(): Promise<PermissionState | null> {
  const { data, error } = await tryCatch(
    navigator.permissions.query({ name: "camera" as PermissionName }),
  );
  if (error) return null;
  return data.state;
}
