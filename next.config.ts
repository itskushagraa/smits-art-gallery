import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : "tscxalabdpeyqibgdulz.supabase.co";

const nextConfig: NextConfig = {
  images: {

    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],

    localPatterns: [
      { pathname: "/api/media/**" },
      { pathname: "/**" },
    ],
  },
};

export default nextConfig;
