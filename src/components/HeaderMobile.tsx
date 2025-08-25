"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function HeaderMobile() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] border-b border-[#e6f4ef] bg-[#F3EeE9]/80 backdrop-blur md:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-sans text-2xl font-semibold text-[#0c1c17]">
          SmitsArtStudio
        </Link>

        <button
          ref={btnRef}
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e6f4ef] bg-white"
        >
          <span className="relative block h-3.5 w-4">
            <span
              className={[
                "absolute inset-x-0 top-0 h-0.5 bg-[#0c1c17] transition-[transform,opacity] duration-200",
                "motion-reduce:transition-none",
                open ? "translate-y-1.5 rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "absolute inset-x-0 top-1.5 h-0.5 bg-[#0c1c17] transition-opacity duration-200",
                "motion-reduce:transition-none",
                open ? "opacity-0" : "opacity-100",
              ].join(" ")}
            />
            <span
              className={[
                "absolute inset-x-0 bottom-0 h-0.5 bg-[#0c1c17] transition-[transform,opacity] duration-200",
                "motion-reduce:transition-none",
                open ? "-translate-y-1.5 -rotate-45" : "",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      <button
        aria-hidden
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-[45] transition-opacity duration-200",
          "motion-reduce:transition-none",
          open ? "bg-black/30 opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      <div
        aria-hidden={!open}
        className={[
          "fixed right-3 top-16 z-[70] w-48 overflow-hidden rounded-lg border border-[#e6f4ef] bg-white shadow-xl",
          "origin-top-right transform transition-all duration-200 ease-out",
          "motion-reduce:transition-none motion-reduce:transform-none",
          open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
               : "opacity-0 -translate-y-2 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <nav className="grid">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-[15px] text-[#0c1c17] font-sans uppercase font-light hover:bg-[#f3f7f5]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}