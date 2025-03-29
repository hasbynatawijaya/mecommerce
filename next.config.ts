import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "4ahi8mmwr8.ufs.sh",
        port:''
      },
    ],
  },
};

export default nextConfig;
