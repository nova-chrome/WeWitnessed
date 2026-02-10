export const REACTION_EMOJIS = {
  heart: "\u2764\uFE0F",
  fire: "\uD83D\uDD25",
  laugh: "\uD83D\uDE02",
  cry: "\uD83E\uDD79",
  clap: "\uD83D\uDC4F",
} as const;

export type EmojiKey = keyof typeof REACTION_EMOJIS;

export const EMOJI_KEYS: EmojiKey[] = ["heart", "fire", "laugh", "cry", "clap"];
