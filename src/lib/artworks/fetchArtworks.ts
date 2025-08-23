import { supabase } from "@/lib/supabase";
import type { Artwork } from "@/components/works/Card";


export type Sort = "price_asc" | "price_desc" | "size_asc" | "size_desc" | "random";
type Category = "figurative" | "landscape" | "abstract" | "prints";

type DbArtwork = {
  slug: string;
  title: string;
  category: Category;
  description: string | null;
  width_cm: number | null;
  height_cm: number | null;
  price: number | null;
  available: boolean | null;
  media: { kind: string; url: string }[] | null;
};

function firstInteriorUrl(media: DbArtwork["media"]) {
  const arr = Array.isArray(media) ? media : [];
  return arr.find((m) => m?.kind === "interior" && m?.url)?.url;
}

export async function fetchArtworks(opts: {
  category?: Category;
  sort?: Sort;
  min_price?: number;
  max_price?: number;
  min_w?: number;
  max_w?: number;
  min_h?: number;
  max_h?: number;
  availableOnly?: boolean;
}): Promise<Artwork[]> {
  let q = supabase
    .from("artwork")
    .select(
      "slug,title,category,description,width_cm,height_cm,price,available,media"
    );

  if (opts.category) q = q.eq("category", opts.category);
  if (opts.availableOnly) q = q.eq("available", true);
  if (opts.min_price != null) q = q.gte("price", opts.min_price);
  if (opts.max_price != null) q = q.lte("price", opts.max_price);
  if (opts.min_w != null) q = q.gte("width_cm", opts.min_w);
  if (opts.max_w != null) q = q.lte("width_cm", opts.max_w);
  if (opts.min_h != null) q = q.gte("height_cm", opts.min_h);
  if (opts.max_h != null) q = q.lte("height_cm", opts.max_h);

  const { data, error } = await q;
  if (error) {
    console.error("[fetchArtworks]", error.message);
    return [];
  }

  const items: Artwork[] = (data as DbArtwork[]).map((r) => {
    const hasInterior = !!firstInteriorUrl(r.media); // presence check only
    const fullKey = `${r.slug}/full_1200_wm.webp`;
    const interiorKey = hasInterior ? `${r.slug}/interior_1200_wm.webp` : undefined;
  
    return {
      slug: r.slug,
      title: r.title,
      width_cm: r.width_cm ?? 0,
      height_cm: r.height_cm ?? 0,
      price: r.price ?? null,
      available: (r.available ?? true) === true,
      full_image_path: fullKey,
      interior_image_path: interiorKey,
    };
  });  

  const area = (a: Artwork) => (a.width_cm || 0) * (a.height_cm || 0);
  switch (opts.sort) {
    case "price_asc":
      items.sort(
        (a, b) =>
          (a.price ?? Number.POSITIVE_INFINITY) -
          (b.price ?? Number.POSITIVE_INFINITY)
      );
      break;
    case "price_desc":
      items.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      break;
    case "size_asc":
      items.sort((a, b) => area(a) - area(b));
      break;
    case "size_desc":
      items.sort((a, b) => area(b) - area(a));
      break;
    case "random":
      items.sort(() => Math.random() - 0.5);
      break;
    default:
      break;
  }

  return items;
}
