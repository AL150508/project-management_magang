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
        // Offline fallback untuk navigation requests
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: "NetworkOnly",
        options: {
          cacheName: "pages-cache",
          networkTimeoutSeconds: 3,
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
    // DISABLE navigateFallback untuk mencegah offline page muncul saat online
    // Offline page hanya akan muncul jika user benar-benar tidak bisa akses network
    // navigateFallback: "/offline.html", // DISABLED
    // navigateFallbackAllowlist: [], // DISABLED
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
      /^\?.*bypass.*/, // Bypass URLs
    ],
    // Enable navigationPreload untuk performa yang lebih baik
    navigationPreload: true,
  },
});

// Konfigurasi Next.js untuk aplikasi management magang
const nextConfig: NextConfig = {
  // Konfigurasi untuk mengatasi masalah Turbopack dengan font
  experimental: {
    turbo: {
      resolveAlias: {
        // Workaround untuk font issues di Turbopack
        '@next/font/google': 'next/font/google',
      },
    },
  },
  // Transpile packages yang mungkin bermasalah
  transpilePackages: ['next-font'],
};

export default withPWA(nextConfig);
