import { NextResponse } from "next/server";
import { fetchArtworks } from "@/lib/artworks/fetchArtworks";

function isAvailable(a: any): boolean {
  if ("sold" in a) return a.sold === false;
  if ("isSold" in a) return a.isSold === false;
  if ("available" in a) return a.available !== false;
  if ("status" in a) return String(a.status).toLowerCase() !== "sold";
  return true; // if no flag, assume available
}

/**
 * GET /api/contact-artworks[?available=true]
 * Returns: { items: Array<{ slug: string; title: string; thumbUrl: string; available: boolean }> }
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const onlyAvailable = url.searchParams.get("available") === "true";
    const items = await fetchArtworks({});

    const list = (onlyAvailable ? items.filter(isAvailable) : items).map((a: any) => {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET!;
      return {
        slug: a.slug,
        title: a.title ?? a.name ?? a.slug,
        thumbUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${a.slug}/full.jpeg`,
        available: isAvailable(a),
      };
    });

    return NextResponse.json({ items: list }, { status: 200 });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
