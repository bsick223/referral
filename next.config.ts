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
        hostname: "rugged-fox-602.convex.cloud",
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
