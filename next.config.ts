import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: [
        "http://localhost:3000",
        "https://learning.manajemensistem.com",
      ],
    },
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      new URL("https://res.cloudinary.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
};

export default nextConfig;
