import { supabase } from "@/lib/supabase";

type Category = "figurative" | "landscape" | "abstract" | "prints";

export type DbArtwork = { 
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

export async function fetchArtworkBySlug(slug: string): Promise<DbArtwork | null> {
  const { data, error } = await supabase
    .from("artwork")
    .select("slug,title,category,description,width_cm,height_cm,price,available,media")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("[fetchArtworkBySlug]", error.message);
    return null;
  }
  return data as DbArtwork;
}
