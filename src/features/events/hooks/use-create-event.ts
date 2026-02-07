"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function useCreateEvent() {
  const createEvent = useMutation(api.events.create);

  return { createEvent };
}
