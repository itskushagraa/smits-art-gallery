"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Pill = { label: string; value?: "figurative" | "landscape" | "abstract" | "prints" };

const PILLS: Pill[] = [
  { label: "All", value: undefined },
  { label: "Figurative", value: "figurative" },
  { label: "Landscape", value: "landscape" },
  { label: "Abstract", value: "abstract" },
  { label: "Prints on Demand", value: "prints" },
];

export default function CategoryPills({ selected }: { selected?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setCategory = useCallback(
    (value?: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete("category");
      else next.set("category", value);
      next.delete("cursor");
      router.push(`${pathname}?${next.toString()}`, { scroll: true });
    },
    [params, pathname, router]
  );

  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto pb-1">
      {PILLS.map((p) => {
        const active = (!!p.value && p.value === selected) || (!p.value && !selected);
        return (
          <button
            key={p.label}
            onClick={() => setCategory(p.value)}
            className={
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition " +
              (active
                ? "border-transparent bg-[#1E3A5F] text-white shadow-sm"
                : "border-black/10 bg-white text-[#0c1c17] hover:border-[#019863] hover:text-[#019863]")
            }
            aria-pressed={active}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
