"use client";

import { useState } from "react";
import InfoTooltip from "@/components/InfoToolTip";

type InquiryKind = "exhibition" | "commission";

export default function ExhibitionCommissionForm() {
  const [kind, setKind] = useState<InquiryKind>("exhibition");

  // shared
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const subject = "Exhibition / Commission Inquiry";

  // exhibition-specific
  const [org, setOrg] = useState("");
  const [dates, setDates] = useState("");
  const [location, setLocation] = useState("");
  const [site, setSite] = useState("");

  // commission-specific
  const [size, setSize] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [reference, setReference] = useState("");

  // message
  const [message, setMessage] = useState("");

  return (
    <form className="grid gap-5">
      {/* top row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Your name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
          />
        </Field>
      </div>

      {/* subject (read-only to signal purpose) */}
      <Field label="Subject">
        <input
          value={subject}
          readOnly
          className="w-full cursor-default rounded-md border border-[#e6f4ef] bg-[#f7fbf9] px-3 py-2 text-sm text-[#0c1c17]"
        />
      </Field>

      {/* segmented selector with hoverable info */}
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#0c1c17]">Type</span>
          <InfoTooltip
            text="Commissions are reviewed case-by-case. Requests may be declined based on schedule, style, or policies. No payment is due until approved."
            size={16}
          />
        </div>
        <div
          role="group"
          aria-label="Inquiry type"
          className="inline-flex w-fit rounded-lg border border-[#e6f4ef] bg-white p-1"
        >
          <SegBtn active={kind === "exhibition"} onClick={() => setKind("exhibition")}>
            Exhibition
          </SegBtn>
          <SegBtn active={kind === "commission"} onClick={() => setKind("commission")}>
            Commission
          </SegBtn>
        </div>
      </div>

      {/* conditional details */}
      {kind === "exhibition" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Organization / Gallery (optional)">
            <input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Gallery name"
              className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
            />
          </Field>
          <Field label="Proposed dates (optional)">
            <input
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="e.g., Nov 12–25, 2025"
              className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
            />
          </Field>
          <Field label="Location / City (optional)">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
            />
          </Field>
          <Field label="Website or event link (optional)">
            <input
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="https://"
              className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
            />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Desired size / medium (optional)">
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g., 70×70 cm, oil on canvas"
              className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
            />
          </Field>
          <Field label="Deadline / timeline (optional)">
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g., by Jan 2026"
              className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
            />
          </Field>
          <Field label="Budget (optional)">
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g., ₹, C$, or USD range"
              className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
            />
          </Field>
          <Field label="Reference link (optional)">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Inspiration / brief link"
              className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
            />
          </Field>
        </div>
      )}

      {/* message */}
      <Field label="Your message">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder={
            kind === "exhibition"
              ? "Tell me about the venue, theme, expected dates, and any logistics."
              : "Describe the concept, style, color palette, and any constraints."
          }
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

      {/* submit (disabled; wiring later) */}
      <div className="pt-2">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-md bg-[#0c1c17] px-4 py-2 text-sm font-medium text-white opacity-70"
          title="Wiring will be added later"
        >
          Send Inquiry
        </button>
      </div>
    </form>
  );
}

/* --- small UI primitives (local) --- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#0c1c17]">{label}</span>
      {children}
    </label>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md px-3 py-1.5 text-sm font-medium transition",
        active ? "bg-[#0c1c17] text-white" : "text-[#0c1c17] hover:bg-[#f3f7f5]",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
