import "./globals.css";

import { cormorant, lato } from "@/app/fonts";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
    title: "SmitsArtStudio",
    description: "Art Gallery Website",
    icons: {
        icon: "/icon.png",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (

        <html className={`${cormorant.variable} ${lato.variable}`} lang="en">
            <body className="font-sans">
                {children}
                <SpeedInsights />
                <Analytics />
            </body>
        </html>
    );
}