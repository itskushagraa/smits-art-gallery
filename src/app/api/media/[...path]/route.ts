// app/api/media/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis client (reads UPSTASH_REDIS_REST_URL/TOKEN from env)
const redis = Redis.fromEnv();

// 120 requests / minute per IP (overall)
const rlIp = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, "1 m"),
    prefix: "rl:media:ip",
});

// 30 requests / minute per asset path (throttles hotlinking to one file)
const rlPath = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:media:path",
});

export const dynamic = "force-dynamic";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

function timingSafeEqual(a: string, b: string) {
    const A = Buffer.from(a), B = Buffer.from(b);
    if (A.length !== B.length) return false;
    try { return crypto.timingSafeEqual(A, B); } catch { return false; }
}

function verifySig(path: string, exp: number, sig: string) {
    const secret = process.env.MEDIA_TOKEN_SECRET;
    if (!secret) return false;
    const now = Math.floor(Date.now() / 1000);
    const SKEW = 15;
    if (!Number.isFinite(exp) || exp + SKEW <= now) return false;
  
    const expected = crypto.createHmac("sha256", secret)
      .update(`${path}|${exp}`)
      .digest("base64url");
  
    return timingSafeEqual(sig, expected);
  }

const allowedPattern = /^[a-z0-9-]+\/(full|interior)_(1600|1200|800|480)_wm\.webp$/i;

export async function GET(
    req: NextRequest,
    ctx: { params: Promise<{ path: string[] }> }
) {
    const { path } = await ctx.params;
    const objectPath = path.join("/"); // e.g. "deja-vu/full_1600_wm.webp"
    if (!allowedPattern.test(objectPath)) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const url = new URL(req.url);
    const exp = Number(url.searchParams.get("exp") ?? 0);
    const sig = url.searchParams.get("sig") ?? "";
    if (!verifySig(objectPath, exp, sig)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limit
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "0.0.0.0";

    const [resIp, resPath] = await Promise.all([
        rlIp.limit(`ip:${ip}`),
        rlPath.limit(`path:${objectPath}`),
    ]);

    if (!resIp.success || !resPath.success) {
        const resetAt = Math.max(resIp.reset, resPath.reset); // epoch ms
        const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
        return NextResponse.json(
            { error: "Too many requests" },
            {
                status: 429,
                headers: {
                    "Retry-After": String(retryAfter),
                    "Cache-Control": "no-store",
                },
            }
        );
    }

    const { data, error } = await supabase
        .storage
        .from("artworks-derivatives")
        .download(objectPath);

    if (error || !data) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // after
    const blob = data as Blob;
    return new NextResponse(blob, {
        headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
            "Content-Disposition": `inline; filename="${objectPath.split("/").pop()}"`,
            "X-Content-Type-Options": "nosniff",
        },
    });
}