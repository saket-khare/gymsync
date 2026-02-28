import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer', 'googleapis', 'bcryptjs', '@anthropic-ai/sdk'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
