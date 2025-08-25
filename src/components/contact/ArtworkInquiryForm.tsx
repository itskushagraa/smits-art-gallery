"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

// types
export type ArtworkOption = {
  slug: string;
  title: string;
  thumbUrl: string;
  available: boolean;
};

declare global {
  interface Window {
    __turnstileToken?: string;
  }
}

export default function ArtworkInquiryForm({
  artworks,
  preselectSlug,
}: {
  artworks: ArtworkOption[];
  preselectSlug?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<ArtworkOption | null>(null);

  // UX state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>("");

  // token state (kept in sync so we can disable the button + show hint)
  const [tokenReady, setTokenReady] = useState<boolean>(false);

  // honeypot
  const [hp, setHp] = useState("");

  // keep tokenReady updated (ContactGate keeps widget mounted & auto‑refreshing)
  useEffect(() => {
    const check = () => setTokenReady(Boolean(typeof window !== "undefined" && window.__turnstileToken));
    check();
    const id = window.setInterval(check, 2000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  // Preselect when artworks load or when preselectSlug changes
  useEffect(() => {
    if (!preselectSlug || !artworks?.length) return;
    const match = artworks.find((a) => a.slug === preselectSlug);
    if (match && selected?.slug !== match.slug) {
      setSelected(match);
    }
  }, [preselectSlug, artworks, selected]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || sent) return;

    setError("");

    // grab current token and block if missing/expired
    const turnstileToken =
      (typeof window !== "undefined" && window.__turnstileToken) || "";

    if (!turnstileToken) {
      setError("Please verify you’re not a bot (use the widget above) before sending.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "artwork",
          name,
          email,
          message,
          artwork: selected ? { slug: selected.slug, title: selected.title } : null,
          hp,
          turnstileToken,
        }),
      });
      const json = await res.json();
      if (json?.success) {
        setSent(true);
        // optional: clear fields
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(json?.error || "Failed to send. Please try again.");
      }
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-md border border-[#e6f4ef] bg-white p-4 text-[#0c1c17]">
        <h3 className="text-base font-semibold">Inquiry sent</h3>
        <p className="mt-1 text-sm">
          Thank you. The artist will review your message and respond personally.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      {/* Name + Email */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Your name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
      </div>

      {/* Artwork dropdown */}
      <Field label="Select artwork">
        <ThumbnailSelect
          options={artworks}
          value={selected}
          onChange={setSelected}
          placeholder="Choose an artwork"
        />
      </Field>

      {/* Message */}
      <Field label="Your message">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Tell me what you’d like to know about this piece."
          required
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

      {/* Honeypot (hidden) */}
      <input
        name="company"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={sending || !tokenReady}
          className="rounded-md bg-[#0c1c17] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          title={!tokenReady ? "Please complete the verification above first." : undefined}
        >
          {sending ? "Sending…" : "Send Inquiry"}
        </button>
        {!tokenReady && (
          <p className="mt-2 text-xs text-[#0c1c17]/70">
            Please verify you’re not a bot using the challenge above to enable sending.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

/* ---------- small UI primitives ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#0c1c17]">{label}</span>
      {children}
    </label>
  );
}

function ThumbnailSelect({
  options,
  value,
  onChange,
  placeholder = "Select",
}: {
  options: ArtworkOption[];
  value: ArtworkOption | null;
  onChange: (opt: ArtworkOption) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // keyboard navigation
  function onKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown") setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    if (e.key === "ArrowUp") setActiveIndex((i) => Math.max(i - 1, 0));
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) {
        onChange(opt);
        setOpen(false);
        requestAnimationFrame(() => btnRef.current?.focus());
      }
    }
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-left text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
      >
        <div className="flex items-center gap-3 truncate">
          {value ? (
            <>
              <div className="relative h-8 w-8 overflow-hidden rounded">
                <Image src={value.thumbUrl} alt="" fill className="object-cover" sizes="32px" />
              </div>
              <span className="truncate">{value.title}</span>
            </>
          ) : (
            <span className="text-[#0c1c17]/60">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} className="shrink-0 text-[#0c1c17]/70" />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-md border border-[#e6f4ef] bg-white p-1 shadow-lg"
        >
          {options.map((opt, i) => {
            const isSelected = value?.slug === opt.slug;
            const active = i === activeIndex;
            return (
              <button
                key={opt.slug}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  setOpen(false);
                  requestAnimationFrame(() => btnRef.current?.focus());
                }}
                className={[
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                  active ? "bg-[#f3f7f5]" : "",
                ].join(" ")}
              >
                <div className="relative h-10 w-10 overflow-hidden rounded">
                  <Image src={opt.thumbUrl} alt="" fill className="object-cover" sizes="40px" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[#0c1c17]">{opt.title}</div>
                  <div className="mt-0.5">
                    <span
                      className={[
                        "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                        opt.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                      ].join(" ")}
                    >
                      {opt.available ? "Available" : "Sold"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}