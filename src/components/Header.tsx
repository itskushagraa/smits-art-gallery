// components/Header.tsx
"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[#e6f4ef] bg-[#F3EeE9]/90 px-10 py-4 backdrop-blur-md">
      {/* Logo + Name */}
      <div className="flex items-center gap-3 text-[#0c1c17]">
        <h1 className="text-xl font-sans font-extrabold tracking-tight">SmitsArtStudio</h1>
      </div>

      {/* Nav links + search */}
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-8 text-sm font-medium text-[#0c1c17]">
          <Link href="/" className="hover:text-[#019863] transition-colors font-sans font-light">
            Home
          </Link>
          <Link href="/works" className="hover:text-[#019863] transition-colors font-sans font-light">
            Works
          </Link>
          <Link href="/about" className="hover:text-[#019863] transition-colors font-sans font-light">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#019863] transition-colors font-sans font-light">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
