import type { NextConfig } from "next";

// Konfigurasi PWA dengan next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable di development
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 jam
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 tahun
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        },
      },
    },
  ],
});

// Konfigurasi Next.js untuk aplikasi management magang
const nextConfig: NextConfig = {
  // TAMBAH DI SINI: Konfigurasi Next.js
  // Contoh konfigurasi yang bisa ditambahkan:
  // - experimental: { appDir: true } // Untuk App Router
  // - images: { domains: ['example.com'] } // Untuk optimasi gambar
  // - env: { CUSTOM_KEY: 'value' } // Environment variables
  // - redirects: async () => [...] // URL redirects
  // - rewrites: async () => [...] // URL rewrites
};

export default withPWA(nextConfig);
