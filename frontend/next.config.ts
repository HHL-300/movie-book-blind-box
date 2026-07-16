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
    domains: ['img1.doubanio.com', 'img2.doubanio.com', 'img3.doubanio.com', 'img9.doubanio.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img1.doubanio.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img9.doubanio.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img2.doubanio.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img3.doubanio.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;