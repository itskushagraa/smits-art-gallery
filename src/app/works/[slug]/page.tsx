// app/works/[slug]/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import InfoToolTip from "@/components/InfoToolTip";
import { notFound } from "next/navigation";
import { fetchArtworkBySlug } from "@/lib/artworks/fetchArtworkBySlug";
import MediaCarousel from "@/components/works/MediaCarousel";



const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function resolveImage(urlOrPath?: string) {
    if (!urlOrPath) return undefined;
    const raw = urlOrPath.trim();
    if (/^https?:\/\//i.test(raw)) return raw;                 // absolute
    const p = raw.replace(/^\/+/, "");                          // strip leading slash
    return `${SUPABASE_URL}/storage/v1/object/public/${p}`;     // path includes 'artworks/...'
}

export const revalidate = 60;

export default async function ArtworkPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const data = await fetchArtworkBySlug(slug);
    if (!data) notFound();

    const available = (data.available ?? true) === true;
    const w = data.width_cm ?? 0;
    const h = data.height_cm ?? 0;
    const interiorUrl =
        (Array.isArray(data.media) ? data.media.find((m) => m?.kind === "interior")?.url : undefined) || undefined;
    const fullUrl = data.primary_image_url || undefined;

    const interiorAbs = resolveImage(interiorUrl);
    const fullAbs = resolveImage(fullUrl);

    const slides = [fullAbs, interiorAbs].filter(Boolean) as string[];

    // Aspect ratio from real dimensions (fallback to 4/3)
    const aspectRatio = w && h ? `${w} / ${h}` : "4 / 3";

    const sizeText = w && h ? `${w}×${h} cm` : null;
    const priceText =
        data.price == null ? "Available on request" : `$${data.price.toLocaleString()}`;

    return (
        <main className="flex min-h-screen flex-col bg-[#f8fcfa]">
            <Header />

            <div className="pt-16 md:pt-20 flex-1 px-6 md:px-20 py-8 md:py-10">
                <Link
                    href="/works"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-[#019863] hover:underline"
                >
                    ← Back to Works
                </Link>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                    {/* Image */}
                    <MediaCarousel
                        slides={slides}
                        alt={data.title}
                        sold={!available}
                        maxVh={68}   // cap at ~68% of viewport height
                        minPx={360}  // never shorter than 360px
                        maxPx={820}  // never taller than ~820px on huge screens
                    />

                    {/* Details */}
                    <section className="flex flex-col">
                        <h1 className="font-serif text-4xl md:text-5xl font-extrabold leading-tight text-[#0c1c17]">
                            {data.title}
                        </h1>

                        {/* Chips */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#e8f6f0] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#019863]">
                                {data.category}
                            </span>
                            {sizeText && (
                                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-[#0c1c17]/80">
                                    {sizeText}
                                </span>
                            )}
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${available
                                    ? "bg-[#019863] text-white"
                                    : "bg-[#dc2626] text-white"
                                    }`}
                            >
                                {available ? "Available" : "Sold"}
                            </span>

                            <InfoToolTip text="Dimensions are approximate; colors may vary by display." />
                        </div>

                        {/* Price */}
                        <div className="mt-6 flex items-center gap-2 text-2xl font-semibold text-[#0c1c17]">
                            {available ? (
                                <span className="text-[#0c1c17]">{priceText}</span>
                            ) : (
                                <span className="text-[#0c1c17]/60 line-through">{priceText}</span>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

                        {/* Description */}
                        {data.description && (
                            <p className="max-w-prose text-[15px] leading-relaxed text-[#0c1c17]/85">
                                {data.description}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={`/contact?artwork=${slug}`}
                                className="rounded-lg bg-[#019863] px-5 py-2 text-sm font-medium text-white shadow hover:brightness-110"
                            >
                                Inquire
                            </Link>
                            {/* Removed “Keep browsing” per your note */}
                        </div>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
