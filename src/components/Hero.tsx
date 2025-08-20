// components/Hero.tsx
"use client";

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[480px] items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-16"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('/artworks/being-lotus/interior.JPG')",
      }}
    >
      <div className="flex max-w-3xl flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-serif font-extrabold leading-tight text-white md:text-5xl">
          SmitsArtStudio – Contemporary Works Across the Globe
        </h1>
        <p className="text-sm text-gray-100 md:text-base">
          International exhibitions, unique pieces, and commissioned art.
        </p>
        <button className="mt-4 rounded-lg bg-[#019863] px-5 py-2.5 text-sm font-bold text-[#f8fcfa] transition-colors hover:bg-[#46a080] md:text-base">
          Explore Works
        </button>
      </div>
    </section>
  );
}
