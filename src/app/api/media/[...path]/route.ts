// app/api/media/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

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
    if (!Number.isFinite(exp) || exp <= now) return false;

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
        },
    });

}