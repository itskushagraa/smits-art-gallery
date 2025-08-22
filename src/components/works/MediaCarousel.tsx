// src/components/works/MediaCarousel.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function MediaCarousel({
  slides,
  alt = "",
  sold = false,
  maxVh = 68,   // cap height by viewport (%)
  minPx = 360,  // minimum height in px
  maxPx = 820,  // hard cap on large screens
  feather = 0.1, // 0–0.4: how much of the edge fades out (18% default)
}: {
  slides: string[];
  alt?: string;
  sold?: boolean;
  maxVh?: number;
  minPx?: number;
  maxPx?: number;
  feather?: number;
}) {
  const uniqSlides = useMemo(
    () => Array.from(new Set(slides.filter(Boolean))),
    [slides]
  );
  const [i, setI] = useState(0);

  // keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!uniqSlides.length) return;
      if (e.key === "ArrowRight") setI((v) => (v + 1) % uniqSlides.length);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + uniqSlides.length) % uniqSlides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [uniqSlides.length]);

  const boxStyle: React.CSSProperties = {
    height: `clamp(${minPx}px, ${maxVh}svh, ${maxPx}px)`,
  };

  if (uniqSlides.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-[#f8fcfa] text-sm text-black/50"
        style={boxStyle}
      >
        No image
      </div>
    );
  }

  // Build the feathered mask: solid center -> transparent edges
  const solidPct = Math.max(0, Math.min(100, Math.round((1 - feather) * 100))); // e.g., 82
  const mask = `radial-gradient(ellipse at center, black ${solidPct}%, transparent 100%)`;

  return (
    <div className="relative rounded-2xl" style={boxStyle}>
      {/* Feathered stage: fades image edges into the page (no harsh card) */}
      <div
        className="relative h-full w-full"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {/* Slides */}
        {uniqSlides.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-500 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={idx !== i}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className={`object-contain object-center ${
                sold ? "grayscale brightness-75 contrast-90" : ""
              }`}
              sizes="(max-width:768px) 100vw, 50vw"
              priority={idx === 0}
            />
          </div>
        ))}

        {/* Controls (minimal, glassy) */}
        {uniqSlides.length > 1 && (
          <>
            <button
              onClick={() => setI((v) => (v - 1 + uniqSlides.length) % uniqSlides.length)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/25 px-2 py-1 text-white backdrop-blur-sm hover:bg-black/35"
            >
              ‹
            </button>
            <button
              onClick={() => setI((v) => (v + 1) % uniqSlides.length)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/25 px-2 py-1 text-white backdrop-blur-sm hover:bg-black/35"
            >
              ›
            </button>

            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
              {uniqSlides.map((_, d) => (
                <button
                  key={d}
                  onClick={() => setI(d)}
                  aria-label={`Go to image ${d + 1}`}
                  className={`h-2 w-2 rounded-full ${
                    d === i ? "bg-black/80" : "bg-black/40 hover:bg-black/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
