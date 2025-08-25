// next.config.ts
import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : "tscxalabdpeyqibgdulz.supabase.co";

const nextConfig: NextConfig = {
  images: {
    // If you want to force-disable Next/Image optimization everywhere:
    // unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        // public bucket objects
        pathname: "/storage/v1/object/public/**",
      },
      // If you ever serve non-public objects via signed URLs, add:
      // { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/**" },
    ],

    // Keep this only if you still route images through /api/media (we now use direct URLs):
    // If you've removed /api/media, you can delete localPatterns entirely.
    localPatterns: [
      { pathname: "/api/media/**" },
      { pathname: "/**" }, // anything in /public (e.g., /pfp.png)
    ],
  },
};

export default nextConfig;
