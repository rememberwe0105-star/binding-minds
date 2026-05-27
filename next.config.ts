import type { NextConfig } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://libertron.iptime.org:8787';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Firebase Storage
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      },
      {
        // Firebase Storage (legacy)
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        // AWS S3
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        // Cloudflare R2 / CDN
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        // Generic storage — backend API server
        protocol: 'https',
        hostname: 'storage.example.com',
      },
      {
        // Backend API (for proxied images)
        protocol: 'http',
        hostname: 'libertron.iptime.org',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${API_BASE_URL}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/success',
        destination: '/donation/success',
        permanent: false,
      },
      {
        source: '/cancel',
        destination: '/donation/cancel',
        permanent: false,
      },
      {
        source: '/campaigns',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/campaigns/org/:slug',
        destination: '/charities/:slug',
        permanent: true,
      },
      {
        source: '/campaigns/:slug',
        destination: '/projects/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
