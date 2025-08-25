// components/Hero.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";

const AUTOPLAY_MS = 4000;
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="; // ★

const gradCache = new Map<string, string>();

function gradient(c1: string, c2: string) {
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}

async function gradientFromImage(src: string): Promise<string> {
  const hit = gradCache.get(src);
  if (hit) return hit;

  const res = await fetch(src, { cache: "force-cache" });
  if (!res.ok) throw new Error("image fetch failed");
  const blob = await res.blob();

  const img = document.createElement("img");
  const url = URL.createObjectURL(blob);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("img load failed"));
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const S = 32;
  canvas.width = S;
  canvas.height = S;
  ctx.drawImage(img, 0, 0, S, S);
  URL.revokeObjectURL(url);

  let r1 = 0, g1 = 0, b1 = 0, n1 = 0;
  let r2 = 0, g2 = 0, b2 = 0, n2 = 0;
  const data = ctx.getImageData(0, 0, S, S).data;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      if (l < 140) { r1 += r; g1 += g; b1 += b; n1++; }
      else { r2 += r; g2 += g; b2 += b; n2++; }
    }
  }

  const c1 = `rgb(${Math.round(r1 / Math.max(1, n1))} ${Math.round(g1 / Math.max(1, n1))} ${Math.round(b1 / Math.max(1, n1))})`;
  const c2 = `rgb(${Math.round(r2 / Math.max(1, n2))} ${Math.round(g2 / Math.max(1, n2))} ${Math.round(b2 / Math.max(1, n2))})`;

  const g = gradient(c1, c2);
  gradCache.set(src, g);
  return g;
}

export default function Hero({ slides }: { slides: string[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const total = slides?.length ?? 0;

  const [gradA, setGradA] = useState<string>(gradient("#374151", "#6B7280"));
  const [gradB, setGradB] = useState<string>(gradient("#374151", "#6B7280"));
  const [showA, setShowA] = useState(true);

  const next = () => setIndex((v) => (total ? (v + 1) % total : 0));
  const prev = () => setIndex((v) => (total ? (v - 1 + total) % total : 0));

  const swipe = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
    delta: 10,
  });

  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [total, index]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || paused || total <= 1) return;
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused, prefersReducedMotion, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  useEffect(() => {
    if (!slides?.[index]) return;

    let aborted = false;
    (async () => {
      try {
        const g = await gradientFromImage(slides[index]);
        if (aborted) return;
        if (showA) {
          setGradB(g);
          requestAnimationFrame(() => setShowA(false));
        } else {
          setGradA(g);
          requestAnimationFrame(() => setShowA(true));
        }
      } catch {}
    })();

    return () => { aborted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slides]);

  if (total === 0) return null;

  // ★ Only load the current and the immediate next slide; others are a transparent 1px.
  const nextIndex = (index + 1) % total;
  const srcFor = (i: number) =>
    i === index || i === nextIndex ? slides[i] : TRANSPARENT_PIXEL;

  return (
    <section
      {...swipe}
      style={{ touchAction: "pan-y" }}
      className="relative h-[68vh] min-h-[520px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured interiors slideshow"
    >
      {/* Slides (stacked, cross-fade) */}
      <div className="absolute inset-0">
        {slides.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== index}
          >
            <NextImage
              src={srcFor(i)}                // ★ stable transitions; non-active use 1×1
              alt=""
              fill
              unoptimized                    // ★ hit Supabase Smart CDN directly
              priority={i === index}         // ★ only active slide is eager
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/40" />
          </div>
        ))}
      </div>

      {/* Content (unchanged) */}
      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <h1 className="font-sans text-4xl font-light leading-tight uppercase text-white md:text-6xl">
          SmitsArtStudio<br className="hidden md:block" />
        </h1>
        <p className="font-sans uppercase font-light mt-4 max-w-4xl text-base text-white/85 md:text-xl">
          Art that embodies wholeness and spiritual resonance through
        </p>

        {/* Gradient button cross-fade (unchanged) */}
        <button
          onClick={() => router.push("/works")}
          className="relative mt-8 overflow-hidden rounded-xl px-6 py-3 font-extralight uppercase text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label="Explore works"
          style={{ background: "transparent" }}
        >
          <span
            className={`absolute inset-0 rounded-xl transition-opacity duration-700 ease-in-out ${showA ? "opacity-100" : "opacity-0"}`}
            style={{ background: gradA }}
            aria-hidden
          />
          <span
            className={`absolute inset-0 rounded-xl transition-opacity duration-700 ease-in-out ${showA ? "opacity-0" : "opacity-100"}`}
            style={{ background: gradB }}
            aria-hidden
          />
          <span className="relative z-10">Explore Works</span>
        </button>
      </div>

      {/* Controls (unchanged) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/35 px-3 py-2 backdrop-blur">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="rounded-full px-2 py-1 text-white/90 hover:bg-white/10"
          >
            ‹
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="rounded-full px-2 py-1 text-white/90 hover:bg-white/10"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
