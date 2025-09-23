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
        hostname: 'api.fitz.ms',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.fitzmuseum.cam.ac.uk',
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
      }
    ],
  },
};

export default nextConfig;
