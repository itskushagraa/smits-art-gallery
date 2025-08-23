import Image from "next/image";
import Link from "next/link";
import { signedMediaUrl } from "@/lib/mediaUrl";

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

const TRANSPARENT_PIXEL =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function media(key?: string, target: 1600 | 1200 | 800 | 480 = 800, ttl = 60) {
    if (!key) return TRANSPARENT_PIXEL;
        const normalized = key.replace(/_(1600|1200|800|480)_/, `_${target}_`);
        return signedMediaUrl(normalized, ttl);
}

function fmtPrice(p: number | null) {
    if (p === null || Number.isNaN(p)) return "Available on request";
    return `$${p.toLocaleString()}`;
}

export default function Card({ artwork }: { artwork: Artwork }) {
    const sold = !artwork.available;
    const interiorSrc = media(artwork.interior_image_path || artwork.full_image_path, 800);
    const fullSrc = media(artwork.full_image_path || artwork.interior_image_path, 800);


    return (
        <Link
            href={`/works/${artwork.slug}`}
            className="group relative block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition"
        >
            {/* image */}
            <div
                className="relative aspect-[4/3]"
                style={sold ? { filter: "brightness(0.9)" } : undefined} // keep sold dim here if you want
            >
                {/* base: interior (fills card); blur slightly on hover */}
                <Image
                    src={interiorSrc}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-[filter,transform] duration-300 group-hover:blur-sm group-hover:scale-[1.01]"
                    sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
                />

                {/* hover: full.jpeg fits inside, fades in */}
                <Image
                    src={fullSrc}
                    alt={`${artwork.title} (full view)`}
                    fill
                    className="z-10 object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
                />

                {sold && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#dc2626] px-2.5 py-0.5 text-xs font-medium text-white shadow">
                        Sold
                    </span>
                )}
            </div>

            {/* text */}
            <div className="flex items-center justify-between gap-2 px-3 py-3">
                <div>
                    <h3 className="line-clamp-1 font-serif text-[15px] font-semibold text-[#0c1c17]">
                        {artwork.title}
                    </h3>
                    <p className="text-xs text-[#0c1c17]/70">
                        {artwork.width_cm}×{artwork.height_cm} cm
                    </p>
                </div>
                <span className="whitespace-nowrap text-sm text-[#0c1c17]">
                    {fmtPrice(artwork.price)}
                </span>
            </div>

            {/* hover overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    View details
                </div>
            </div>
        </Link>
    );
}
