import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
