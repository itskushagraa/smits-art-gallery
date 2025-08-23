// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // keep or remove this; it's harmless even though we use the proxy now
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tscxalabdpeyqibgdulz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // IMPORTANT: allow local images too (e.g., /pfp.png)
    localPatterns: [
      { pathname: "/api/media/**" }, // our proxied images
      { pathname: "/**" },           // anything from /public (incl. /pfp.png)
      // If you prefer tighter scope, use: { pathname: "/pfp.png" }
    ],
  },
};

export default nextConfig;
