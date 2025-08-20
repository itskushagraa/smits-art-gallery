"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Sort =
  | "price_asc"
  | "price_desc"
  | "size_asc"
  | "size_desc"
  | "random";

export default function SortSelect({ value }: { value?: Sort }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString());
    const v = e.target.value as Sort;

    if (!v) next.delete("sort");
    else next.set("sort", v);

    // reset pagination whenever sort changes
    next.delete("cursor");

    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-[#0c1c17]">
      <span className="hidden sm:inline">Sort</span>
      <select
        className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm outline-none transition hover:border-[#019863] focus:border-[#019863]"
        value={value ?? ""}
        onChange={onChange}
      >
        <option value="">—</option>
        <option value="price_asc">Price ↑</option>
        <option value="price_desc">Price ↓</option>
        <option value="size_asc">Size ↑</option>
        <option value="size_desc">Size ↓</option>
        <option value="random">Random</option>
      </select>
    </label>
  );
}
