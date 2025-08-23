// components/Hero.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";

const AUTOPLAY_MS = 3000; // 5s

export default function Hero({ slides }: { slides: string[] }) {
    const router = useRouter();
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const total = slides?.length ?? 0;

    const next = () => setIndex((v) => (total ? (v + 1) % total : 0));
    const prev = () => setIndex((v) => (total ? (v - 1 + total) % total : 0));

    const swipe = useSwipeable({
        onSwipedLeft: next,
        onSwipedRight: prev,
        preventScrollOnSwipe: true,
        trackTouch: true,
        trackMouse: true, // set true if you want drag on desktop too
        delta: 10,         // sensitivity
    });
    
    // keep index in range if slides change
    useEffect(() => {
        if (index >= total) setIndex(0);
    }, [total, index]);

    // Respect reduced motion
    const prefersReducedMotion = useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    }, []);

    // Autoplay
    useEffect(() => {
        if (prefersReducedMotion || paused || total <= 1) return;
        intervalRef.current = window.setInterval(() => {
            setIndex((i) => (i + 1) % total);
        }, AUTOPLAY_MS);
        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [paused, prefersReducedMotion, total]);

    // Keyboard support (←/→)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total);
            if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [total]);

    if (total === 0) return null;

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
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === index ? "opacity-100" : "opacity-0"
                            }`}
                        aria-hidden={i !== index}
                    >
                        <Image
                            src={src}
                            alt=""
                            fill
                            priority={i === 0}
                            className="object-cover"
                            sizes="100vw"
                        />
                        {/* Dark gradient for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/40" />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
                <h1 className="font-serif text-4xl font-extrabold leading-tight text-white md:text-6xl">
                    SmitsArtStudio –<br className="hidden md:block" />
                    Contemporary Works Across the Globe
                </h1>
                <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">
                    International exhibitions, unique pieces, and commissioned art.
                </p>

                <button
                    onClick={() => router.push("/works")}
                    className="mt-8 rounded-xl bg-[#0ea36b] px-6 py-3 font-medium text-white shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/60"
                    aria-label="Explore works"
                >
                    Explore Works
                </button>
            </div>

            {/* Controls */}
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
                                className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"
                                    }`}
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
