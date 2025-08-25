// src/lib/mediaUrl.ts

// Public base for the *derivatives* bucket (must be PUBLIC)
const PUBLIC_BASE =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artworks-derivatives`;

const ALLOWED_KEY = /^[a-z0-9-]+\/(full|interior)_(1600|1200|800|480)_wm\.webp$/i;

/** Build a stable public URL for a derivative asset. */
export function mediaUrl(key: string): string {
  if (!ALLOWED_KEY.test(key)) {
    throw new Error(`Invalid media key: ${key}`);
  }
  return `${PUBLIC_BASE}/${key}`;
}

/** Back-compat alias so callers don't need refactors right now. */
export const signedMediaUrl = mediaUrl;

/** Optional helpers to avoid string mistakes elsewhere. */
export type MediaVariant = "full" | "interior";
export type MediaWidth = 480 | 800 | 1200 | 1600;
export const mediaKey = (slug: string, variant: MediaVariant, w: MediaWidth) =>
  `${slug}/${variant}_${w}_wm.webp`;
