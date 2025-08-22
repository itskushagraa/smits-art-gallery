import { Noto_Serif, Noto_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata = {
    title: "SmitsArtStudio",
    description: "Art gallery website",
    icons: {
      icon: "/icon.png", // path in public/
    },
  };

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