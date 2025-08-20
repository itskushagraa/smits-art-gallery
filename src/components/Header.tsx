// components/Header.tsx
"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[#e6f4ef] bg-[#f8fcfa]/90 px-10 py-4 backdrop-blur-md">
      {/* Logo + Name */}
      <div className="flex items-center gap-3 text-[#0c1c17]">
        <svg
          viewBox="0 0 48 48"
          fill="currentColor"
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
          />
        </svg>
        <h1 className="text-lg font-bold tracking-tight">SmitsArtStudio</h1>
      </div>

      {/* Nav links + search */}
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-8 text-sm font-medium text-[#0c1c17]">
          <Link href="/" className="hover:text-[#019863] transition-colors">
            Home
          </Link>
          <Link href="/works" className="hover:text-[#019863] transition-colors">
            Works
          </Link>
          <Link href="/about" className="hover:text-[#019863] transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#019863] transition-colors">
            Contact
          </Link>
        </nav>

        <button className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e6f4ef] text-[#0c1c17] hover:bg-[#d4ece3] transition-colors">
          <Search size={18} />
        </button>
      </div>
    </header>
  );
}
