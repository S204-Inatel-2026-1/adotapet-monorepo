// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'http://localhost:3000/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      // imagens de ilustração (Unsplash) usadas nas telas de login e registro
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;