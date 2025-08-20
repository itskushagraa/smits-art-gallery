// components/Footer.tsx
"use client";

import { Instagram, Mail } from "lucide-react";
import { SiThreads } from "react-icons/si";

export default function Footer() {
    return (
        <footer className="flex flex-col items-center justify-center gap-6 bg-[#f8fcfa] px-6 py-10 text-center">
            {/* Social icons */}
            <div className="flex gap-6">
                <a
                    href="https://www.instagram.com/smitajsharma"
                    className="text-[#46a080] transition-colors hover:text-[#019863]"
                    aria-label="Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Instagram size={24} />
                </a>

                <a
                    href="https://www.threads.net/@smitajsharma"
                    className="text-[#46a080] transition-colors hover:text-[#019863]"
                    aria-label="Threads"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <SiThreads className="h-6 w-6" />
                </a>

                <a
                    href="/contact"
                    className="text-[#46a080] transition-colors hover:text-[#019863]"
                    aria-label="Email"
                >
                    <Mail size={24} />
                </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-[#46a080]">
                © {new Date().getFullYear()} SmitsArtStudio. All rights reserved.
            </p>
        </footer>
    );
}