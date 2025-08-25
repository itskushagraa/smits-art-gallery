// components/Categories.tsx
import Link from "next/link";
import Image from "next/image";
import { signedMediaUrl } from "@/lib/mediaUrl";

type Category = {
  title: string;
  image: string;
  slug: string;
};

// Use watermarked, private derivatives via the proxy
const categories: Category[] = [
  {
    title: "Figurative",
    image: signedMediaUrl("transcendental-dreams/full_1200_wm.webp"),
    slug: "figurative",
  },
  {
    title: "Landscape",
    image: signedMediaUrl("stargazing/full_1200_wm.webp"),
    slug: "landscape",
  },
  {
    // temporary until clientwork is received
    title: "Abstract",
    image: signedMediaUrl("the-eye/full_1200_wm.webp"),
    slug: "abstract",
  },
  {
    title: "Prints on Demand",
    image: signedMediaUrl("homes-of-sand/full_1200_wm.webp"),
    slug: "prints",
  },
];

export default function Categories() {
  return (
    <section className="px-6 py-12 md:px-20">
      <h1 className="mb-4 text-3xl font-sans font-light uppercase text-[#0c1c17]">
        Categories
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={`/works?category=${cat.slug}`}
            className="relative flex aspect-video items-end justify-start overflow-hidden rounded-lg bg-cover bg-center p-4 transition-transform hover:scale-[1.02]"
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
            <p className="z-10 text-base font-sans font-light uppercase text-white">
              {cat.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}