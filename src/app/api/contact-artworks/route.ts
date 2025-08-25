import { NextResponse } from "next/server";
import { fetchArtworks } from "@/lib/artworks/fetchArtworks";
import { signedMediaUrl } from "@/lib/mediaUrl";

type ArtworkLike = {
  slug: string;
  title?: string;
  name?: string;
  sold?: boolean;
  isSold?: boolean;
  available?: boolean;
  status?: string;
};

function isAvailable(a: ArtworkLike): boolean {
  if ("sold" in a && typeof a.sold === "boolean") return a.sold === false;
  if ("isSold" in a && typeof a.isSold === "boolean") return a.isSold === false;
  if ("available" in a && typeof a.available === "boolean") return a.available !== false;
  if ("status" in a && typeof a.status === "string") return a.status.toLowerCase() !== "sold";
  return true;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const onlyAvailable = url.searchParams.get("available") === "true";

    const items = (await fetchArtworks({})) as ArtworkLike[];

    const list = (onlyAvailable ? items.filter(isAvailable) : items).map((a: ArtworkLike) => ({
      slug: a.slug,
      title: a.title ?? a.name ?? a.slug,
      thumbUrl: signedMediaUrl(`${a.slug}/full_480_wm.webp`),
      available: isAvailable(a),
    }));

    return NextResponse.json({ items: list }, { status: 200 });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
