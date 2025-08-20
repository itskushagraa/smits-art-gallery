// components/Header.tsx
"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[#e6f4ef] bg-[#f8fcfa]/90 px-10 py-4 backdrop-blur-md">
      {/* Logo + Name */}
      <div className="flex items-center gap-3 text-[#0c1c17]">
        <h1 className="text-lg font-serif font-bold tracking-tight">SmitsArtStudio</h1>
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
