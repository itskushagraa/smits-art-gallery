"use client";

import { Info } from "lucide-react";

export default function InfoTooltip({
  text,
  className = "",
  size = 16,
}: {
  text: string;
  className?: string;
  size?: number;
}) {
  return (
    <span className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label="Artwork info"
        className="rounded-full p-1 text-[#019863] hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#019863]/40"
      >
        <Info size={size} />
      </button>

      {/* Tooltip bubble */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-black/90" />
      </span>
    </span>
  );
}
