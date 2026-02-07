"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const DEVICE_ID_KEY = "wewitnessed:deviceId";
const GUEST_KEY_PREFIX = "wewitnessed:guest:";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

interface GuestSession {
  guestId: Id<"guests"> | null;
  guestName: string | null;
  deviceId: string;
  isReady: boolean;
  createGuest: (name: string) => Promise<Id<"guests">>;
}

export function useGuestSession(
  slug: string,
  eventId: Id<"events"> | undefined,
): GuestSession {
  const [deviceId] = useState(getOrCreateDeviceId);
  const createGuestMutation = useMutation(api.guests.create);

  const existingGuest = useQuery(
    api.guests.getByDevice,
    eventId && deviceId ? { eventId, deviceId } : "skip",
  );

  // Check localStorage for cached guestId (faster than waiting for query)
  const [cachedGuestId] = useState<Id<"guests"> | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`${GUEST_KEY_PREFIX}${slug}`);
    return stored ? (stored as Id<"guests">) : null;
  });

  const guestId = existingGuest?._id ?? cachedGuestId;
  const guestName = existingGuest?.name ?? null;

  const isReady = deviceId !== "" && existingGuest !== undefined;

  const createGuest = useCallback(
    async (name: string): Promise<Id<"guests">> => {
      if (!eventId) throw new Error("Event not loaded");
      if (!deviceId) throw new Error("Device ID not ready");

      const id = await createGuestMutation({
        eventId,
        name,
        deviceId,
      });

      localStorage.setItem(`${GUEST_KEY_PREFIX}${slug}`, id);
      return id;
    },
    [eventId, deviceId, slug, createGuestMutation],
  );

  return {
    guestId,
    guestName,
    deviceId,
    isReady,
    createGuest,
  };
}
