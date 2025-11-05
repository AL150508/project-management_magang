import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/role-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manajemen Magang - SMK Brantas Karangkates",
  description: "Sistem pelaporan magang siswa SMK Brantas Karangkates",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Magang Portal",
  },
};

// Pastikan area aman (notch) pada perangkat mobile terhormati
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Magang Portal" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-[env(safe-area-inset-top)] min-h-[100dvh] bg-white sm:bg-gradient-to-b sm:from-blue-50 sm:via-cyan-50 sm:to-transparent`}
      >
        {/* dekorasi latar: sembunyikan di layar kecil untuk menghindari crop/overflow */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden sm:block">
          {/* top-left blob */}
          <div className="bg-blue-200/50 absolute -left-40 -top-40 h-80 w-80 rounded-full blur-3xl" />
          {/* top-right blob */}
          <div className="bg-cyan-200/50 absolute -right-28 -top-24 h-72 w-72 rounded-full blur-3xl" />
          {/* center background gradient wash */}
          <div className="from-blue-100 via-cyan-50 to-transparent absolute inset-0 bg-gradient-to-b" />
          {/* bottom-right blob */}
          <div className="bg-blue-300/40 absolute -right-40 bottom-[-6rem] h-[28rem] w-[28rem] rounded-full blur-[90px]" />
          {/* bottom-left subtle blob */}
          <div className="bg-sky-200/40 absolute -left-24 bottom-[-4rem] h-72 w-72 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <RoleProvider>{children}</RoleProvider>
        </div>
      </body>
    </html>
  );
}
