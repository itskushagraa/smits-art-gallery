// components/Categories.tsx
"use client";

type Category = {
  title: string;
  image: string;
};

const categories: Category[] = [
  {
    title: "Figurative",
    image: "/artworks/figurative/interior.png",
  },
  {
    title: "Landscape",
    image: "/artworks/landscape/interior.png",
  },
  {
    title: "Abstract",
    image: "/artworks/abstract/interior.png",
  },
  {
    title: "Prints on Demand",
    image: "/artworks/prints/interior.png",
  },
];

export default function Categories() {
  return (
    <section className="px-6 py-12 md:px-20">
      <h1 className="mb-4 text-3xl font-serif font-bold text-[#0c1c17]">Categories</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="relative flex aspect-video items-end justify-start overflow-hidden rounded-lg bg-cover bg-center p-4 transition-transform hover:scale-[1.02]"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0)), url(${cat.image})`,
            }}
          >
            <p className="z-10 text-base font-serif font-semibold text-white">
              {cat.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
