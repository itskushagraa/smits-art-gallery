// lib/mediaUrl.ts
import crypto from "crypto";

export function signedMediaUrl(path: string, ttlSec = 60) {
  const secret = process.env.MEDIA_TOKEN_SECRET!;
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const sig = crypto.createHmac("sha256", secret)
    .update(`${path}|${exp}`)
    .digest("base64url");
  return `/api/media/${path}?exp=${exp}&sig=${sig}`;
}