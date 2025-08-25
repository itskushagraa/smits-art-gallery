"use client";

import { Instagram, Mail } from "lucide-react";
import { SiThreads, SiEtsy, SiRedbubble, SiPinterest } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-6 bg-[#F3EeE9] px-6 py-10 text-center">
      <div className="flex gap-6">
        <a
          href="https://www.instagram.com/smitajsharma"
          className="text-[#C6A343] transition-colors hover:text-[#019863]"
          aria-label="Instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram size={24} />
        </a>

        <a
          href="https://www.threads.net/@smitajsharma"
          className="text-[#C6A343] transition-colors hover:text-[#019863]"
          aria-label="Threads"
          target="_blank"
          rel="noopener noreferrer"
        >
          <SiThreads className="h-6 w-6" />
        </a>

        <a
          href="https://www.etsy.com/shop/smitsartstudio/"
          className="text-[#C6A343] transition-colors hover:text-[#019863]"
          aria-label="Etsy"
          target="_blank"
          rel="noopener noreferrer"
        >
          <SiEtsy className="h-6 w-6" />
        </a>

        <a
          href="https://www.redbubble.com/people/artsmitten/"
          className="text-[#C6A343] transition-colors hover:text-[#019863]"
          aria-label="Redbubble"
          target="_blank"
          rel="noopener noreferrer"
        >
          <SiRedbubble className="h-6 w-6" />
        </a>

        <a
          href="https://www.pinterest.com/smitsartstudio/"
          className="text-[#C6A343] transition-colors hover:text-[#019863]"
          aria-label="Pinterest"
          target="_blank"
          rel="noopener noreferrer"
        >
          <SiPinterest className="h-6 w-6" />
        </a>

        <a
          href="/contact"
          className="text-[#C6A343] transition-colors hover:text-[#019863]"
          aria-label="Email"
        >
          <Mail size={24} />
        </a>
      </div>

      <p className="text-sm text-[#C6A343] font-sans font-light">
        © {new Date().getFullYear()} SmitsArtStudio. All rights reserved.
      </p>
    </footer>
  );
}
