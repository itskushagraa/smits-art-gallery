import "./globals.css";

import { cormorant, lato } from "@/app/fonts";

export const metadata = {
    title: "SmitsArtStudio",
    description: "Art gallery website",
    icons: {
        icon: "/icon.png", // path in public/
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (

        <html className={`${cormorant.variable} ${lato.variable}`} lang="en">
            <body className="font-sans">{children}</body>
        </html>
    );
}