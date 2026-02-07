"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const COUPLE_KEY_PREFIX = "wewitnessed:couple:";

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
  const [coupleSecret] = useState<string | null>(() => {
    const fromUrl = readSecretFromUrl();
    if (fromUrl) {
      localStorage.setItem(`${COUPLE_KEY_PREFIX}${slug}`, fromUrl);
      return fromUrl;
    }
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`${COUPLE_KEY_PREFIX}${slug}`);
  });

  // Clean secret from URL after mount
  useEffect(() => {
    if (readSecretFromUrl()) {
      const url = new URL(window.location.href);
      url.searchParams.delete("s");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const isVerified = useQuery(
    api.events.verifyCoupleSecret,
    eventId && coupleSecret ? { eventId, coupleSecret } : "skip",
  );

  useEffect(() => {
    if (isVerified === false && coupleSecret) {
      localStorage.removeItem(`${COUPLE_KEY_PREFIX}${slug}`);
    }
  }, [isVerified, coupleSecret, slug]);

  return {
    isCouple: isVerified === true,
    coupleSecret: isVerified === true ? coupleSecret : null,
    isLoading: isVerified === undefined && coupleSecret !== null,
  };
}
