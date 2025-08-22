"use client";

import { useState } from "react";

export default function OtherInquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <form className="grid gap-5">
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

      <Field label="Subject">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What is this about?"
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

      <Field label="Your message">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Write your question or note here."
          className="w-full rounded-md border border-[#e6f4ef] bg-white px-3 py-2 text-sm text-[#0c1c17] outline-none focus:ring-2 focus:ring-[#0c1c17]/15"
        />
      </Field>

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

/* small local primitive to match other forms */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#0c1c17]">{label}</span>
      {children}
    </label>
  );
}