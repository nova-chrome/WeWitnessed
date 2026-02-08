"use client";

import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { STORAGE_KEYS } from "~/lib/storage-keys";

function readSecretFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("s");
}

interface CoupleSession {
  isCouple: boolean;
  coupleSecret: string | null;
  isLoading: boolean;
}

export function useCoupleSession(
  slug: string,
  eventId: Id<"events"> | undefined,
): CoupleSession {
  const [coupleSecret, setCoupleSecret, removeCoupleSecret] = useLocalStorage<
    string | null
  >(STORAGE_KEYS.couple(slug), null);

  // Persist secret from URL and clean the search param
  useEffect(() => {
    const fromUrl = readSecretFromUrl();
    if (fromUrl) {
      setCoupleSecret(fromUrl);
      const url = new URL(window.location.href);
      url.searchParams.delete("s");
      window.history.replaceState({}, "", url.toString());
    }
  }, [setCoupleSecret]);

  const isVerified = useQuery(
    api.events.verifyCoupleSecret,
    eventId && coupleSecret ? { eventId, coupleSecret } : "skip",
  );

  useEffect(() => {
    if (isVerified === false && coupleSecret) {
      removeCoupleSecret();
    }
  }, [isVerified, coupleSecret, removeCoupleSecret]);

  return {
    isCouple: isVerified === true,
    coupleSecret: isVerified === true ? coupleSecret : null,
    isLoading: isVerified === undefined && coupleSecret !== null,
  };
}
