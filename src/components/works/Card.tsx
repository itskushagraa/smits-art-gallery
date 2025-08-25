import Image from "next/image";
import Link from "next/link";
import { mediaUrl, mediaKey } from "@/lib/mediaUrl";

export type Artwork = {
    slug: string;
    title: string;
    width_cm: number;
    height_cm: number;
    price: number | null;
    available: boolean;
    interior_image_path?: string;
    full_image_path?: string;
};

function fmtPrice(p: number | null) {
    if (p === null || Number.isNaN(p)) return "Available on request";
    return `$${p.toLocaleString()}`;
}

export default function Card({ artwork }: { artwork: Artwork }) {
    const sold = !artwork.available;

    const interiorKey = mediaKey(artwork.slug, "interior", 800);
    const fullKey = mediaKey(artwork.slug, "full", 800);

    const interiorSrc = mediaUrl(interiorKey);
    const fullSrc = mediaUrl(fullKey);

    return (
        <Link
            href={`/works/${artwork.slug}`}
            className="group relative block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition"
        >
            <div
                className="relative aspect-[4/3]"
                style={sold ? { filter: "brightness(0.9)" } : undefined}
            >
                <Image
                    src={interiorSrc}
                    alt={artwork.title}
                    fill
                    unoptimized
                    className="object-cover transition-[filter,transform] duration-300 group-hover:blur-sm group-hover:scale-[1.01]"
                    sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
                />

                <Image
                    src={fullSrc}
                    alt={`${artwork.title} (full view)`}
                    fill
                    unoptimized
                    className="z-10 object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
                />

                {sold && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#dc2626] px-2.5 py-0.5 text-xs font-medium text-white shadow">
                        Sold
                    </span>
                )}
            </div>
            
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1 px-3 py-3">
                <div className="min-w-0">
                    <h3 className="line-clamp-2 md:line-clamp-1 font-sand font-light uppercase text-[14px] md:text-[15px] text-[#0c1c17]">
                        {artwork.title}
                    </h3>
                    <p className="text-xs text-[#0c1c17]/70">
                        {artwork.width_cm}×{artwork.height_cm} cm
                    </p>
                </div>

                <span className="row-span-2 self-start whitespace-nowrap text-sm md:text-base text-[#0c1c17]">
                    {fmtPrice(artwork.price)}
                </span>
            </div>

            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    View details
                </div>
            </div>
        </Link>
    );
}
