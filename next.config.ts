import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/new-release",
        destination: "/release",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
