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

  // Host for the initial visible widget (managed)
  const managedHostRef = useRef<HTMLDivElement | null>(null);

  // Host + id for the persistent invisible widget (used for all later submissions)
  const invisibleHostRef = useRef<HTMLDivElement | null>(null);
  const invisibleIdRef = useRef<string | null>(null);

  // Global callbacks for Turnstile
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

  // After first verification, render a persistent INVISIBLE widget we can execute() on demand
  useEffect(() => {
    if (!verified) return;
    if (!siteKey) return;
    if (typeof window === "undefined" || !window.turnstile) return;
    if (!invisibleHostRef.current) return;
    if (invisibleIdRef.current) return; // already rendered

    const id = window.turnstile.render(invisibleHostRef.current, {
      sitekey: siteKey,
      size: "invisible",
      theme: "auto",
      // Whenever execute() completes, this callback fires with a fresh token
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

    // Helper for forms to guarantee a fresh token before submit
    window.__ensureFreshTurnstile = async () => {
      const now = Date.now();
      const age = window.__turnstileIssuedAt ? now - window.__turnstileIssuedAt : Infinity;

      // If no token or older than ~100s, execute() to mint a new one
      if (!window.__turnstileToken || age > 100_000) {
        await new Promise<void>((resolve) => {
          // Temporary hook to resolve once the invisible widget calls its callback
          const orig = window.onTurnstileVerify;
          window.onTurnstileVerify = (tok: string) => {
            // keep Compatibility: also let any other listeners run
            orig?.(tok);
            resolve();
          };
          try {
            window.turnstile?.execute(invisibleIdRef.current || undefined);
          } catch {
            resolve(); // fail open; server will still reject if token is empty
          } finally {
            // restore after a tick
            setTimeout(() => {
              window.onTurnstileVerify = orig;
            }, 0);
          }
        });
      }
      return window.__turnstileToken || "";
    };
  }, [verified, siteKey]);

  // Cleanup helper if component ever unmounts
  useEffect(() => {
    return () => {
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

      {/* Initial gate (managed widget, visible once) */}
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

      {/* Persistent invisible widget host (used for second+ submissions) */}
      <div ref={invisibleHostRef} className="hidden" aria-hidden="true" />

      {verified && <ContactPageInner slides={slides} />}
    </>
  );
}
