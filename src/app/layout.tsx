import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


const serif = Noto_Serif({
    subsets: ["latin"],
    weight: ["400", "500", "700", "900"],
    variable: "--font-serif",
    display: "swap",
});
const sans = Noto_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700", "900"],
    variable: "--font-sans",
    display: "swap",
});

export const metadata = { title: "SmitsArtStudio" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body
                className={`${sans.variable} ${serif.variable} antialiased bg-[#f8fcfa] text-[#0c1c17]`}
            >
                {children}
            </body>
        </html>
    );
}