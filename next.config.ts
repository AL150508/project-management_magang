import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Konfigurasi PWA dengan @ducanh2912/next-pwa (kompatibel dengan Next.js 15)
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Disable hanya di development
  workboxOptions: {
    disableDevLogs: false, // Enable logs untuk debugging
    skipWaiting: true, // Skip waiting untuk update service worker
  runtimeCaching: [
      {
        // Tangani navigation requests (halaman SPA) dengan NetworkFirst
        // Coba network dulu (timeout 3 detik), jika gagal baru gunakan cache
        urlPattern: /^\/(dashboard|logbook|magang|dudi)?\/?$/,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 jam
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          networkTimeoutSeconds: 3, // Timeout 3 detik untuk cek network sebelum fallback ke cache
        },
      },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: "NetworkFirst",
      options: {
          cacheName: "supabase-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 jam
        },
          cacheableResponse: {
            statuses: [0, 200],
          },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
      options: {
          cacheName: "google-fonts",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 tahun
        },
          cacheableResponse: {
            statuses: [0, 200],
          },
      },
    },
    {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
      options: {
          cacheName: "images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        },
          cacheableResponse: {
            statuses: [0, 200],
          },
      },
    },
  ],
    // Konfigurasi navigateFallback: HANYA aktif saat benar-benar offline
    // NetworkFirst handler di atas akan mencoba network dulu (timeout 3 detik)
    // Jika network gagal DAN tidak ada cache, baru fallback ke offline.html
    navigateFallback: "/offline.html",
    navigateFallbackAllowlist: [
      // Hanya untuk route aplikasi utama (SPA routes)
      /^\/$/,
      /^\/dashboard/,
      /^\/logbook/,
      /^\/magang/,
      /^\/dudi/,
    ],
    navigateFallbackDenylist: [
      // Jangan gunakan offline.html untuk:
      /^\/_next\/.*/, // Next.js internal files
      /^\/api\/.*/, // API routes
      /^\/sw\.js/, // Service worker
      /^\/workbox-.*/, // Workbox files
      /^\/offline\.html/, // Offline page itself
      /^\/icons\/.*/, // Icons
      /^\/manifest\.json/, // Manifest
      /^\/.*\.(svg|png|jpg|jpeg|gif|webp|ico|json|js|css)$/, // Static assets
    ],
    // Disable navigationPreload untuk menghindari race condition
    navigationPreload: false,
  },
});

// Konfigurasi Next.js untuk aplikasi management magang
const nextConfig: NextConfig = {
  // Konfigurasi Next.js
};

export default withPWA(nextConfig);
