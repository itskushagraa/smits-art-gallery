"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import ContactPageInner from "@/components/contact/ContactPageInner";

declare global {
    interface Window {
        __turnstileToken?: string;
        __turnstileIssuedAt?: number;
        __ensureFreshTurnstile?: () => Promise<string>;
        onTurnstileVerify?: (token: string) => void;
        onTurnstileExpired?: () => void;
        onTurnstileError?: () => void;
        turnstile?: {
            render: (
                el: Element | string,
                opts: {
                    sitekey: string;
                    callback?: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: () => void;
                    size?: "invisible" | "compact" | "normal";
                    theme?: "auto" | "light" | "dark";
                    refreshExpired?: "auto" | "manual";
                }
            ) => string; // widgetId
            execute: (widgetId?: string) => void;
            reset: (widgetId?: string) => void;
            getResponse: (widgetId?: string) => string | undefined;
        };
    }
}

export default function ContactGate({ slides }: { slides: string[] }) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

    const [verified, setVerified] = useState(false);
    const [widgetError, setWidgetError] = useState<string>("");

    const managedHostRef = useRef<HTMLDivElement | null>(null);
    const managedIdRef = useRef<string | null>(null);

    const invisibleHostRef = useRef<HTMLDivElement | null>(null);
    const invisibleIdRef = useRef<string | null>(null);

    useEffect(() => {
        window.onTurnstileVerify = (t: string) => {
            window.__turnstileToken = t;
            window.__turnstileIssuedAt = Date.now();
            setVerified(true);
            setWidgetError("");
        };
        window.onTurnstileExpired = () => {
            window.__turnstileToken = "";
            window.__turnstileIssuedAt = undefined;
            setVerified(false);
        };
        window.onTurnstileError = () => {
            window.__turnstileToken = "";
            window.__turnstileIssuedAt = undefined;
            setVerified(false);
            setWidgetError("Verification widget error (often domain allow‑list mismatch).");
        };

        return () => {
            delete window.onTurnstileVerify;
            delete window.onTurnstileExpired;
            delete window.onTurnstileError;
        };
    }, []);

    useEffect(() => {
        if (verified) return;
        if (!siteKey) return;
        if (typeof window === "undefined" || !window.turnstile) return;
        if (!managedHostRef.current) return;
        if (managedIdRef.current) return;

        // Ensure host is "clean" so auto-render can't also attach a widget
        try {
            managedHostRef.current.removeAttribute("class");
            managedHostRef.current.removeAttribute("data-sitekey");
            managedHostRef.current.removeAttribute("data-theme");
            managedHostRef.current.removeAttribute("data-refresh-expired");
            managedHostRef.current.removeAttribute("data-callback");
            managedHostRef.current.removeAttribute("data-expired-callback");
            managedHostRef.current.removeAttribute("data-error-callback");
            managedHostRef.current.innerHTML = "";
        } catch { }


        try {
            managedIdRef.current = window.turnstile.render(managedHostRef.current, {
                sitekey: siteKey,
                theme: "auto",
                refreshExpired: "auto",
                callback: (t: string) => window.onTurnstileVerify?.(t),
                "expired-callback": () => window.onTurnstileExpired?.(),
                "error-callback": () => window.onTurnstileError?.(),
            });
        } catch (e) {
            setWidgetError("Failed to initialize verification widget.");
        }
    }, [verified, siteKey]);

    useEffect(() => {
        if (!verified) return;
        if (!siteKey) return;
        if (typeof window === "undefined" || !window.turnstile) return;
        if (!invisibleHostRef.current) return;
        if (invisibleIdRef.current) return;

        const id = window.turnstile.render(invisibleHostRef.current, {
            sitekey: siteKey,
            size: "invisible",
            theme: "auto",
            callback: (t: string) => {
                window.__turnstileToken = t;
                window.__turnstileIssuedAt = Date.now();
            },
            "expired-callback": () => {
                window.__turnstileToken = "";
                window.__turnstileIssuedAt = undefined;
            },
            "error-callback": () => {
                setWidgetError("Invisible token minting failed. Try reloading the page.");
            },
        });
        invisibleIdRef.current = id;

        window.__ensureFreshTurnstile = async () => {
            const now = Date.now();
            const age = window.__turnstileIssuedAt ? now - window.__turnstileIssuedAt : Infinity;

            if (!window.__turnstileToken || age > 100_000) {
                await new Promise<void>((resolve) => {
                    const orig = window.onTurnstileVerify;
                    window.onTurnstileVerify = (tok: string) => {
                        orig?.(tok);
                        resolve();
                    };
                    try {
                        window.turnstile?.execute(invisibleIdRef.current || undefined);
                    } catch {
                        resolve();
                    } finally {
                        setTimeout(() => {
                            window.onTurnstileVerify = orig;
                        }, 0);
                    }
                });
            }
            return window.__turnstileToken || "";
        };
    }, [verified, siteKey]);

    useEffect(() => {
        return () => {
            try { if (managedIdRef.current) window.turnstile?.reset(managedIdRef.current); } catch { }
            delete window.__ensureFreshTurnstile;
        };
    }, []);

    if (!siteKey) {
        return (
            <div className="mx-auto max-w-xl py-24">
                <h1 className="mb-4 text-2xl font-semibold text-[#0c1c17]">Verification unavailable</h1>
                <p className="text-sm text-[#0c1c17]/80">Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY.</p>
            </div>
        );
    }

    return (
        <>
           <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
            {!verified && (
                <div className="mx-auto max-w-xl py-24">
                    <h1 className="mb-4 text-2xl font-semibold text-[#0c1c17]">Verify you’re not a bot</h1>
                    <div
                        ref={managedHostRef}
                        className="cf-turnstile"
                        data-sitekey={siteKey}
                        data-callback="onTurnstileVerify"
                        data-expired-callback="onTurnstileExpired"
                        data-error-callback="onTurnstileError"
                        data-refresh-expired="auto"
                        data-theme="auto"
                    />
                    <p className="mt-2 text-xs text-[#0c1c17]/70">Once verified, the contact forms will appear.</p>
                    {widgetError && <p className="mt-2 text-xs text-red-600">{widgetError}</p>}
                </div>
            )}

            <div ref={invisibleHostRef} className="hidden" aria-hidden="true" />

            {verified && <ContactPageInner slides={slides} />}
        </>
    );
}
