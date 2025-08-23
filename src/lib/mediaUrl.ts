import crypto from "crypto";

const SECRET = process.env.MEDIA_TOKEN_SECRET!;
const CDN_TTL   = Number(process.env.MEDIA_CDN_TTL ?? 604800);
const LEEWAY    = Number(process.env.MEDIA_SIG_LEEWAY ?? 300);

export function signedMediaUrl(key: string) {
  // key like "deja-vu/full_1200_wm.webp"
  const exp = Math.floor(Date.now() / 1000) + CDN_TTL + LEEWAY; // <<< important
  const sig = crypto.createHmac("sha256", SECRET)
    .update(`${key}|${exp}`)
    .digest("base64url");

  return `/api/media/${key}?exp=${exp}&sig=${sig}`;
}
