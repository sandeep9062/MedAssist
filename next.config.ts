import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/vapi/:path*',
        destination: 'https://api.vapi.ai/:path*',
      },
    ]
  },
};

export default nextConfig;
