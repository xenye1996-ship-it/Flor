import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // включает src/instrumentation.ts (автопривязка Max)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
