// components/Categories.tsx
"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Category = {
    title: string;
    image: string;
    slug: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET!;

const categories: Category[] = [
    {
        title: "Figurative",
        image: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/being-lotus/full.jpeg`,
        slug: "figurative",
    },
    {
        title: "Landscape",
        image: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/stargazing/full.jpeg`,
        slug: "landscape",
    },
    {   // temporary until clientwork is received
        title: "Abstract",
        image: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/the-eye/full.jpeg`,
        slug: "abstract",
    },
    {
        title: "Prints on Demand",
        image: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/homes/full.jpeg`,
        slug: "prints",
    },
];

export default function Categories() {
    const router = useRouter();
    return (
        <section className="px-6 py-12 md:px-20">
            <h1 className="mb-4 text-3xl font-serif font-bold text-[#0c1c17]">Categories</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {categories.map((cat) => (
                    <div
                        key={cat.title}
                        onClick={() => router.push(`/works?category=${cat.slug}`)}
                        className="relative flex aspect-video items-end justify-start overflow-hidden rounded-lg bg-cover bg-center p-4 transition-transform hover:scale-[1.02]"
                    >
                        {/* image itself */}
                        <Image
                            src={cat.image}
                            alt={cat.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />

                        {/* dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                        <p className="z-10 text-base font-serif font-semibold text-white">
                            {cat.title}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
