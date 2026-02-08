export const STORAGE_KEYS = {
  DEVICE_ID: "wewitnessed:deviceId",
  guest: (slug: string) => `wewitnessed:guest:${slug}` as const,
  couple: (slug: string) => `wewitnessed:couple:${slug}` as const,
} as const;
