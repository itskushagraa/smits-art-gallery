import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const rlIp = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  prefix: "rl:media:ip",
});
const rlPath = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:media:path",
});

const allowedPattern = /^[a-z0-9-]+\/(full|interior)_(1600|1200|800|480)_wm\.webp$/i;

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const objectPath = path.join("/");
  if (!allowedPattern.test(objectPath)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const referer = req.headers.get("referer") ?? "";
  const host = req.nextUrl.host;
  const proto = req.nextUrl.protocol || "https:";
  const myOriginA = `${proto}//${host}`;
  const myOriginB = process.env.SITE_ORIGIN ?? "";
  const isFirstPartyRef =
    referer.startsWith(myOriginA) || (myOriginB && referer.startsWith(myOriginB)) || referer === "";

  if (!isFirstPartyRef) {}

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const [resIp, resPath] = await Promise.all([
    rlIp.limit(`ip:${ip}`),
    rlPath.limit(`path:${objectPath}`),
  ]);
  if (!resIp.success || !resPath.success) {
    const resetAt = Math.max(resIp.reset, resPath.reset);
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } }
    );
  }

  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artworks-derivatives/`;
  const target = publicBase + objectPath;

  const TTL = Number(process.env.MEDIA_CDN_TTL ?? 31536000);
  const res = NextResponse.redirect(target, 308);
  res.headers.set("Cache-Control", `public, max-age=${TTL}, s-maxage=${TTL}, immutable`);
  res.headers.set("Vary", "Accept");
  return res;
}
