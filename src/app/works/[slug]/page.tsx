import HeaderMobile from "@/components/HeaderMobile";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import InfoToolTip from "@/components/InfoToolTip";
import { notFound } from "next/navigation";
import { fetchArtworkBySlug } from "@/lib/artworks/fetchArtworkBySlug";
import MediaCarousel from "@/components/works/MediaCarousel";
import { mediaUrl, mediaKey } from "@/lib/mediaUrl";

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

  const hasInterior =
    Array.isArray(data.media) && data.media.some((m) => m?.kind === "interior");

  const slides = [
    mediaUrl(mediaKey(slug, "full", 1600)),
    ...(hasInterior ? [mediaUrl(mediaKey(slug, "interior", 1600))] : []),
  ];

  const sizeText = w && h ? `${w}×${h} cm` : null;
  const priceText =
    data.price == null ? "Available on request" : `$${data.price.toLocaleString()}`;

  return (
    <main className="flex min-h-screen flex-col bg-[#F3EeE9] overflow-x-clip">
      <div className="md:hidden"><HeaderMobile /></div>
      <div className="hidden md:block"><Header /></div>

      <div className="pt-16 md:pt-20 flex-1 px-6 md:px-20 py-8 md:py-10">
        <Link
          href="/works"
          prefetch={false}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#019863] hover:underline"
        >
          ← Back to Works
        </Link>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="relative w-full max-w-full overflow-hidden">
            <MediaCarousel
              slides={slides}
              alt={data.title}
              sold={!available}
              maxVh={68}
              minPx={360}
              maxPx={820}
            />
          </div>

          <section className="flex flex-col">
            <h1 className="font-sans uppercase text-4xl md:text-5xl font-light leading-tight text-[#0c1c17]">
              {data.title}
            </h1>

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
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  available ? "bg-[#019863] text-white" : "bg-[#dc2626] text-white"
                }`}
              >
                {available ? "Available" : "Sold"}
              </span>

              <InfoToolTip text="Dimensions are approximate; colors may vary by display." />
            </div>

            <div className="mt-6 flex items-center gap-2 text-2xl font-semibold text-[#0c1c17]">
              {available ? (
                <span className="text-[#0c1c17]">{priceText}</span>
              ) : (
                <span className="text-[#0c1c17]/60 line-through">{priceText}</span>
              )}
            </div>

            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

            {data.description && (
              <p className="max-w-prose text-[15px] leading-relaxed text-[#0c1c17]/85">
                {data.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/contact?artwork=${slug}`}
                className="rounded-lg bg-[#019863] px-5 py-2 text-sm font-medium text-white shadow hover:brightness-110"
              >
                Inquire
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
