"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";
import {
  EMOJI_KEYS,
  REACTION_EMOJIS,
  type EmojiKey,
} from "../utils/emoji-map";

interface ReactionBarProps {
  photoId: Id<"photos">;
  eventId: Id<"events">;
  deviceId?: string;
  className?: string;
}

export function ReactionBar({
  photoId,
  eventId,
  deviceId,
  className,
}: ReactionBarProps) {
  const data = useQuery(api.reactions.getByPhoto, { photoId, deviceId });
  const toggle = useMutation(api.reactions.toggle);

  if (!data) return null;

  const userEmoji = data.userEmoji as EmojiKey | null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1.5 backdrop-blur-md",
        className,
      )}
    >
      {EMOJI_KEYS.map((key) => {
        const count = data.counts[key];
        const isActive = userEmoji === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => deviceId && toggle({ photoId, eventId, deviceId, emoji: key })}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-sm transition-all active:scale-90",
              isActive
                ? "bg-white/20 ring-1 ring-white/40"
                : "hover:bg-white/10",
            )}
            aria-label={`React with ${key}`}
            aria-pressed={isActive}
          >
            <span className="text-base leading-none">
              {REACTION_EMOJIS[key]}
            </span>
            {count > 0 && (
              <span className="text-xs text-white/80 tabular-nums">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
