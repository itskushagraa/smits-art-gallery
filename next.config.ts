import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "tscxalabdpeyqibgdulz.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

module.exports = {
    images: {
      localPatterns: [
        { pathname: '/api/media/**' }, // allows ?exp=&sig=
      ],
    },
  };
  
export default nextConfig;
