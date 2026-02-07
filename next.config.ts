import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
  },
  // API routes
  async rewrites() {
    return [
      {
        source: '/ai/:path*',
        destination: process.env.AI_SERVICE_URL 
          ? `${process.env.AI_SERVICE_URL}/:path*` 
          : 'http://localhost:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
