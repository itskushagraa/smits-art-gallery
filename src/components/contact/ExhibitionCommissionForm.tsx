"use client";

import { useEffect, useState } from "react";

type Kind = "exhibition" | "commission";

declare global {
  interface Window {
    __turnstileToken?: string;
  }
}

export default function ExhibitionCommissionForm({
  presetKind,
}: {
  presetKind?: Kind; // optionally force a starting tab
}) {
  const [kind, setKind] = useState<Kind>(presetKind || "exhibition");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // shared optional fields
  const [org, setOrg] = useState("");
  const [dates, setDates] = useState("");
  const [location, setLocation] = useState("");

  // diverging field: site (exhibition) OR size (commission)
  const [site, setSite] = useState(""); // venue / site conditions
  const [size, setSize] = useState(""); // dimensions / scope

  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [reference, setReference] = useState(""); // link or short ref
  const [message, setMessage] = useState("");

  // UX
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>("");

  // token gate
  const [tokenReady, setTokenReady] = useState(false);

  // honeypot
  const [hp, setHp] = useState("");

  useEffect(() => {
    if (presetKind && presetKind !== kind) setKind(presetKind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKind]);

  // keep tokenReady up-to-date (widget is kept mounted by ContactGate)
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || sent) return;

    setError("");

    // block if token missing/expired
    const turnstileToken =
      (typeof window !== "undefined" && window.__turnstileToken) || "";
    if (!turnstileToken) {
      setError("Please verify you’re not a bot (use the verification above) before sending.");
      return;
    }

    setSending(true);
    try {
      const payload = {
        kind: "exhibition-commission",
        subtype: kind, // "exhibition" | "commission"
        name,
        email,
        message,
        details: {
          org: org || null,
          dates: dates || null,
          location: location || null,
          site: kind === "exhibition" ? site || null : null,
          size: kind === "commission" ? size || null : null,
          deadline: deadline || null,
          budget: budget || null,
          reference: reference || null,
        },
        hp,
        turnstileToken,
      };

      const res = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.success) {
        setSent(true);
        // optional reset
        setName("");
        setEmail("");
        setOrg("");
        setDates("");
        setLocation("");
        setSite("");
        setSize("");
        setDeadline("");
        setBudget("");
        setReference("");
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
          Thank you. The artist will review your proposal and respond personally.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      {/* Kind switcher */}
      <div className="flex gap-2">
        <Toggle
          label="Exhibition"
          active={kind === "exhibition"}
          onClick={() => setKind("exhibition")}
        />
        <Toggle
          label="Commission"
          active={kind === "commission"}
          onClick={() => setKind("commission")}
        />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Your name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Full name"
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
      </div>

      {/* Shared optional info */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Organization (optional)">
          <input
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="Gallery, institution, or client name"
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
        <Field label="Dates / timeline (optional)">
          <input
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            placeholder="e.g., Jan–Mar 2026"
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
      </div>

      <Field label="Location (optional)">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City / Venue"
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

      {/* Diverging field */}
      {kind === "exhibition" ? (
        <Field label="Site conditions / venue notes (optional)">
          <input
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="Ceiling height, wall length, power availability, etc."
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
      ) : (
        <Field label="Size / scope (optional)">
          <input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Dimensions, number of pieces, medium, etc."
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Deadline (optional)">
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="e.g., 15 Oct 2025"
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
        <Field label="Budget (optional)">
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., $4,000–$6,000"
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
      </div>

      <Field label="Reference link (optional)">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Portfolio / moodboard / site plan link"
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

      <Field label="Message">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          placeholder={
            kind === "exhibition"
              ? "Tell me about the exhibition concept and any constraints."
              : "Tell me about the commission idea and expectations."
          }
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

      {/* Honeypot */}
      <input
        name="company"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

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

/* UI primitive */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#0c1c17]">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1.5 text-sm",
        active ? "bg-[#0c1c17] text-white" : "bg-[#e6f4ef] text-[#0c1c17]",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
