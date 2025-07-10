import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maasegyxpoqxdllnwapd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },

  eslint: {
    // Warning: Ini akan menonaktifkan pengecekan ESLint saat build.
    // Hanya gunakan jika Anda terdesak dan akan memperbaikinya nanti.
    ignoreDuringBuilds: true,
  },

  typescript: {
    // ⚠️ PERINGATAN: Ini akan menyembunyikan semua error tipe data saat build.
    // Sangat berisiko untuk produksi dan bisa menyebabkan bug.
    ignoreBuildErrors: true,
  },
};

export default config;