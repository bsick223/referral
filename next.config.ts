import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "i.ytimg.com",
        protocol: "https",
      },
      {
        hostname: "yt3.ggpht.com",
        protocol: "https",
      },
      {
        // Use a dynamic pattern that will work for both dev and prod environments
        // Extract hostname from NEXT_PUBLIC_CONVEX_URL environment variable
        hostname: process.env.NEXT_PUBLIC_CONVEX_URL
          ? new URL(process.env.NEXT_PUBLIC_CONVEX_URL).hostname
          : "dependable-giraffe-309.convex.cloud",
        protocol: "https",
      },
      {
        hostname: "img.clerk.com",
        protocol: "https",
      },
      {
        hostname: "images.clerk.dev",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
