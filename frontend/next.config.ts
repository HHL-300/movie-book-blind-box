import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/douban/:path*',
        destination: 'https://img1.doubanio.com/:path*',
      },
      {
        source: '/api/douban9/:path*',
        destination: 'https://img9.doubanio.com/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;