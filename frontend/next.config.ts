import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.101"],
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/sign-in",
        destination: "/auth/sign-in",
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: "/auth/sign-up",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
