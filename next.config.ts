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
    // Konfigurasi navigateFallback yang lebih tepat
    // Hanya gunakan untuk route aplikasi utama, bukan untuk _next atau api
    navigateFallback: "/offline.html",
    navigateFallbackAllowlist: [
      /^\/$/, // Root path
      /^\/dashboard/, 
      /^\/logbook/, 
      /^\/magang/, 
      /^\/dudi/,
    ],
    navigateFallbackDenylist: [
      /^\/api\/.*/, 
      /^\/_next\/.*/, 
      /^\/sw\.js/, 
      /^\/workbox-.*/, 
      /^\/offline\.html/,
      /^\/icons\/.*/,
      /^\/.*\.(svg|png|jpg|jpeg|gif|webp|ico)$/,
    ],
    // Gunakan NetworkFirst dengan timeout yang lebih panjang untuk navigation
    // Ini akan mencoba network dulu sebelum fallback ke offline.html
    navigationPreload: false, // Disable untuk menghindari masalah
  },
});

// Konfigurasi Next.js untuk aplikasi management magang
const nextConfig: NextConfig = {
  // Konfigurasi Next.js
};

export default withPWA(nextConfig);
