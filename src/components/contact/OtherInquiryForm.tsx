"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __turnstileToken?: string;
  }
}

export default function OtherInquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>("");

  const [hp, setHp] = useState("");

  const [tokenReady, setTokenReady] = useState(false);

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

    const turnstileToken =
      (typeof window !== "undefined" && window.__turnstileToken) || "";

    if (!turnstileToken) {
      setError("Please verify you’re not a bot (use the verification above) before sending.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "other",
          name,
          email,
          subject,
          message,
          hp,
          turnstileToken,
        }),
      });
      const json = await res.json();
      if (json?.success) {
        setSent(true);
        setName("");
        setEmail("");
        setSubject("");
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

      <Field label="Subject">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="What is your inquiry about?"
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

      <Field label="Message">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          placeholder="Share a bit more context."
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#0c1c17]">{label}</span>
      {children}
    </label>
  );
}