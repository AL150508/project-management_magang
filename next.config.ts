import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";
const enablePWADev = process.env.ENABLE_PWA_DEV === "true";

const withPWA = withPWAInit({
  dest: "public",
  disable: isDev && !enablePWADev,
  register: true,
  scope: "/",
  sw: "sw.js",
  workboxOptions: {
    disableDevLogs: true,
    clientsClaim: true,
    skipWaiting: true,
    cleanupOutdatedCaches: true,
    // Import custom push handler
    importScripts: ['/sw-push.js'],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // TEMPORARY: Ignore ESLint during build to allow production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
