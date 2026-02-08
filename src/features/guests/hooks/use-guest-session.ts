"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { STORAGE_KEYS } from "~/lib/storage-keys";

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
  const [fallbackDeviceId] = useState(() => crypto.randomUUID());
  const [deviceId] = useLocalStorage(STORAGE_KEYS.DEVICE_ID, fallbackDeviceId);
  const createGuestMutation = useMutation(api.guests.create);

  const existingGuest = useQuery(
    api.guests.getByDevice,
    eventId && deviceId ? { eventId, deviceId } : "skip",
  );

  const [cachedGuestId, setCachedGuestId] =
    useLocalStorage<Id<"guests"> | null>(STORAGE_KEYS.guest(slug), null);

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

      setCachedGuestId(id);
      return id;
    },
    [eventId, deviceId, createGuestMutation, setCachedGuestId],
  );

  return {
    guestId,
    guestName,
    deviceId,
    isReady,
    createGuest,
  };
}
