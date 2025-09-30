import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.metmuseum.org',
        port: '',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.rijksmuseum.nl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'framemark.vam.ac.uk',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
