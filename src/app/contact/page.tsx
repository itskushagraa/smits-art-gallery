// app/contact/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkInquiryForm, { ArtworkOption } from "@/components/contact/ArtworkInquiryForm";
import ExhibitionCommissionForm from "@/components/contact/ExhibitionCommissionForm";
import OtherInquiryForm from "@/components/contact/OtherInquiryForm";
import { useSearchParams } from "next/navigation";



const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET!;

const INTERIOR_SLIDES = [
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/the-eye/interior.jpeg`,
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/mirrors-and-reflections/interior.jpeg`,
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/released/interior.jpeg`,
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/deja-vu/interior.jpeg`,
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/masquerade/interior.jpeg`,
];

const AUTOPLAY_MS = 4000;
type Purpose = "artwork" | "exhibit" | "other";

export default function ContactPage() {
    return (
        <Suspense fallback={null}>
            <ContactPageInner />
        </Suspense>
    );
}

function ContactPageInner() {
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const [purpose, setPurpose] = useState<Purpose>("artwork");
    const [artworks, setArtworks] = useState<ArtworkOption[]>([]);
    const timerRef = useRef<number | null>(null);
    const searchParams = useSearchParams();
    const preselectSlug = searchParams.get("artwork") || undefined;


    const prefersReducedMotion = useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    }, []);

    // slideshow
    useEffect(() => {
        if (prefersReducedMotion || paused) return;
        timerRef.current = window.setInterval(() => {
            setIdx((i) => (i + 1) % INTERIOR_SLIDES.length);
        }, AUTOPLAY_MS);
        return () => {
            if (timerRef.current !== null) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [paused, prefersReducedMotion]);

    // fetch artworks for the dropdown
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                const res = await fetch("/api/contact-artworks", { cache: "no-store" });
                const json = await res.json();
                if (!aborted) setArtworks((json?.items ?? []) as ArtworkOption[]);
            } catch {
                if (!aborted) setArtworks([]);
            }
        })();
        return () => {
            aborted = true;
        };
    }, []);
    
    return (
        <main className="flex min-h-screen flex-col bg-[#f8fcfa]">
            <Header />

            {/* Immersive background */}
            <section
                className="relative flex-1 overflow-hidden pt-[72px]"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <div className="absolute inset-0">
                    {INTERIOR_SLIDES.map((src, i) => (
                        <div
                            key={src}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === idx ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <Image src={src} alt="" fill priority={i === 0} className="object-cover" sizes="100vw" />
                            <div className="absolute inset-0 bg-black/45" />
                        </div>
                    ))}
                </div>

                {/* Solid card with vertical breathing room */}
                <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:px-0 md:py-24">
                    <div className="w-full rounded-xl bg-[#f8fcfa] p-8 shadow-sm ring-1 ring-black/10">
                        <header className="mb-4">
                            <h1 className="text-3xl font-serif font-bold text-[#0c1c17]">Contact</h1>
                            <p className="mt-2 text-sm text-[#0c1c17]/75">
                                For artwork inquiries, exhibitions/commissions, or other questions.
                            </p>
                        </header>

                        {/* Tabs */}
                        <Tabs purpose={purpose} setPurpose={setPurpose} />

                        {/* Content */}
                        <div className="pt-6">
                            {purpose === "artwork" ? (
                                <ArtworkInquiryForm artworks={artworks} preselectSlug={preselectSlug} />
                            ) : purpose === "exhibit" ? (
                                <ExhibitionCommissionForm />
                            ) : (
                                <OtherInquiryForm />
                            )}
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}

function Tabs({ purpose, setPurpose }: { purpose: Purpose; setPurpose: (p: Purpose) => void }) {
    const Tab = ({ id, label }: { id: Purpose; label: string }) => (
        <button
            type="button"
            onClick={() => setPurpose(id)}
            className={`px-3 py-2 text-sm font-medium transition ${purpose === id ? "text-[#0c1c17] border-b-2 border-[#0c1c17]" : "text-[#0c1c17]/60 hover:text-[#0c1c17]"
                }`}
        >
            {label}
        </button>
    );
    return (
        <div className="border-b border-[#e6f4ef]">
            <nav className="flex gap-6">
                <Tab id="artwork" label="Artwork Inquiries" />
                <Tab id="exhibit" label="Exhibitions / Commissions" />
                <Tab id="other" label="Other" />
            </nav>
        </div>
    );
}
