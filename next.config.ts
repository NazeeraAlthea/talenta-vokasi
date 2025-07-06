import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      // 1. Konfigurasi untuk Supabase LOKAL (saat 'npm run dev')
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      // 2. Konfigurasi untuk Supabase PRODUKSI (saat di Netlify)
      {
        protocol: 'https',
        hostname: 'xyz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
};

export default config;