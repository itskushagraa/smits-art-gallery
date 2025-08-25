"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { mediaUrl } from "@/lib/mediaUrl";

export default function MediaCarousel({
  slides,
  alt = "",
  sold = false,
  maxVh = 68, 
  minPx = 360, 
  maxPx = 820, 
  feather = 0.1,
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

  const resolvedSlides = useMemo(
    () =>
      uniqSlides.map((s) => (/^https?:\/\//i.test(s) ? s : mediaUrl(s))),
    [uniqSlides]
  );

  const [i, setI] = useState(0);
  const len = resolvedSlides.length || 0;

  const next = () => setI((v) => (v + 1) % len);
  const prev = () => setI((v) => (v - 1 + len) % len);

  const swipe = useSwipeable({
    onSwipedLeft: () => len && next(),
    onSwipedRight: () => len && prev(),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
    delta: 10,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!len) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [len]);

  const boxStyle: React.CSSProperties = {
    height: `clamp(${minPx}px, ${maxVh}svh, ${maxPx}px)`,
  };

  if (len === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-[#f8fcfa] text-sm text-black/50"
        style={boxStyle}
      >
        No image
      </div>
    );
  }

  const solidPct = Math.max(0, Math.min(100, Math.round((1 - feather) * 100)));
  const mask = `radial-gradient(ellipse at center, black ${solidPct}%, transparent 100%)`;

  const prefetch = (idx: number) => {
    const url = resolvedSlides[(idx + len) % len];
    if (!url) return;
    const img = new window.Image();
    img.decoding = "async";
    img.src = url;
  };

  const currentSrc = resolvedSlides[i];

  return (
    <div
      className="relative rounded-2xl"
      style={{ ...boxStyle, touchAction: "pan-y" }}
      {...swipe}
    >
      <div
        className="relative h-full w-full"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <Image
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          fill
          unoptimized
          className={`object-contain object-center ${sold ? "brightness-100" : ""}`}
          sizes="(max-width:768px) 100vw, 50vw"
          priority={i === 0}
        />

        {len > 1 && (
          <>
            <button
              onClick={prev}
              onMouseEnter={() => prefetch(i - 1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/25 px-2 py-1 text-white backdrop-blur-sm hover:bg-black/35"
            >
              ‹
            </button>
            <button
              onClick={next}
              onMouseEnter={() => prefetch(i + 1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/25 px-2 py-1 text-white backdrop-blur-sm hover:bg-black/35"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
