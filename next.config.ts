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
        hostname: 'https://maasegyxpoqxdllnwapd.supabase.co',
        port: '',
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