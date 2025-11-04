# Rencana Setup PWA (Progressive Web App)

## Tujuan Penambahan PWA

Menambahkan fitur Progressive Web App (PWA) ke aplikasi **Manajemen Magang** untuk:

1. **Installable** - Aplikasi dapat diinstall sebagai aplikasi native di device (mobile & desktop)
2. **Offline Support** - Aplikasi dapat berjalan offline dengan caching yang tepat
3. **Faster Loading** - Service worker untuk caching assets dan data
4. **Better UX** - Splash screen, app icon, dan pengalaman seperti aplikasi native
5. **Push Notifications** - (Opsional) Notifikasi untuk update magang/logbook

## Daftar File yang Akan Dibuat/Dimodifikasi

### ✅ File yang Sudah Disiapkan

1. **`/public/manifest.json`** ✅
   - File manifest PWA yang mendefinisikan metadata aplikasi
   - Berisi nama, icon, theme color, display mode, dll
   - Status: Sudah dibuat (draft)

2. **`/public/icons/`** ✅
   - Folder untuk menyimpan icon aplikasi
   - Status: Folder sudah dibuat
   - **Tindakan**: Perlu membuat icon `icon-192x192.png` dan `icon-512x512.png`

3. **`next.config.ts`** ✅
   - Konfigurasi Next.js dengan draft PWA configuration
   - Status: Draft konfigurasi sudah ditambahkan (dalam komentar)

### ⚠️ File yang Akan Dibuat Setelah Install next-pwa

4. **`/public/sw.js`** (Auto-generated)
   - Service worker file (akan di-generate otomatis oleh next-pwa)
   - Menangani caching, offline support, push notifications

5. **`/public/workbox-*.js`** (Auto-generated)
   - Workbox runtime files (akan di-generate otomatis oleh next-pwa)
   - Library untuk service worker management

6. **`src/app/layout.tsx`** (Modifikasi)
   - Perlu menambahkan link ke manifest.json
   - Perlu menambahkan meta tags untuk PWA

## Langkah Aktivasi PWA

### Step 1: Install Dependencies

```bash
npm install next-pwa
# atau
yarn add next-pwa
```

**Catatan**: 
- ✅ `package.json` sudah diperiksa, tidak ada konflik dengan dependency yang ada
- ✅ Compatible dengan Next.js 15.5.2

### Step 2: Buat Icon Aplikasi

1. Buat atau siapkan icon aplikasi dengan ukuran minimal 512x512 pixels
2. Resize ke ukuran yang diperlukan:
   - `icon-192x192.png` (192x192 pixels)
   - `icon-512x512.png` (512x512 pixels)
3. Simpan icon di folder `/public/icons/`

**Tools yang bisa digunakan**:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### Step 3: Aktifkan Konfigurasi PWA di next.config.ts

1. Buka file `next.config.ts`
2. Uncomment konfigurasi PWA yang sudah disiapkan
3. Atau tambahkan konfigurasi berikut:

```typescript
import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // ... konfigurasi runtime caching (lihat next.config.ts)
})

const nextConfig: NextConfig = {
  // ... konfigurasi lain
}

export default withPWA(nextConfig)
```

### Step 4: Tambahkan Link ke Manifest di Layout

Buka `src/app/layout.tsx` dan tambahkan:

```typescript
export const metadata: Metadata = {
  title: "Manajemen Magang - SMK Brantas Karangkates",
  description: "Sistem pelaporan magang siswa SMK Brantas Karangkates",
  manifest: "/manifest.json", // Tambahkan ini
  themeColor: "#2563eb", // Tambahkan ini
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Magang Portal",
  },
  // ... metadata lain
}
```

Atau tambahkan di `<head>`:

```tsx
<head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#2563eb" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Magang Portal" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
</head>
```

### Step 5: Build dan Test

1. Build aplikasi:
   ```bash
   npm run build
   ```

2. Test di development (dengan disable PWA):
   ```bash
   npm run dev
   ```

3. Test di production build:
   ```bash
   npm run build
   npm run start
   ```

4. Test PWA:
   - Buka di browser (Chrome/Edge)
   - Buka DevTools → Application tab
   - Cek Service Worker sudah terdaftar
   - Cek Manifest sudah terdeteksi
   - Test "Add to Home Screen" di mobile browser

## Checklist Testing Dasar untuk PWA

### ✅ Testing Manifest

- [ ] Manifest.json dapat diakses di `/manifest.json`
- [ ] Manifest valid (tidak ada error di DevTools → Application → Manifest)
- [ ] Icon terdeteksi dengan benar
- [ ] Theme color sesuai
- [ ] Start URL benar

### ✅ Testing Service Worker

- [ ] Service worker terdaftar setelah build
- [ ] Service worker aktif (status: activated)
- [ ] Tidak ada error di console
- [ ] Caching bekerja (cek di Application → Cache Storage)

### ✅ Testing Installable

- [ ] Aplikasi dapat diinstall (muncul prompt "Add to Home Screen")
- [ ] Icon muncul di home screen setelah install
- [ ] Aplikasi terbuka sebagai standalone (tanpa address bar browser)
- [ ] Splash screen muncul saat membuka aplikasi

### ✅ Testing Offline

- [ ] Matikan internet (offline mode)
- [ ] Refresh halaman
- [ ] Aplikasi masih dapat diakses (dengan cached data)
- [ ] Halaman error offline muncul jika halaman belum pernah dibuka

### ✅ Testing Performance

- [ ] Aplikasi load lebih cepat setelah install
- [ ] Assets di-cache dengan benar
- [ ] Tidak ada request yang tidak perlu saat offline

### ✅ Testing Cross-Platform

- [ ] Test di Chrome (Android/Desktop)
- [ ] Test di Edge (Android/Desktop)
- [ ] Test di Safari (iOS) - jika memungkinkan
- [ ] Test di Firefox (Desktop) - jika memungkinkan

## Konfigurasi Runtime Caching

Konfigurasi caching sudah disiapkan di `next.config.ts` untuk:

1. **Supabase API** - NetworkFirst strategy
   - Cache data Supabase selama 24 jam
   - Fallback ke network jika cache tidak ada

2. **Google Fonts** - CacheFirst strategy
   - Cache fonts selama 1 tahun
   - Load dari cache untuk performa lebih baik

3. **Images** - CacheFirst strategy
   - Cache gambar selama 30 hari
   - Load dari cache untuk performa lebih baik

## Troubleshooting

### Service Worker tidak terdaftar
- Pastikan build production (`npm run build`)
- Service worker tidak aktif di development mode (default behavior)
- Cek di DevTools → Application → Service Workers

### Manifest tidak terdeteksi
- Pastikan link ke manifest.json ada di `<head>`
- Pastikan file `/public/manifest.json` ada dan valid JSON
- Cek di DevTools → Application → Manifest

### Icon tidak muncul
- Pastikan icon file ada di `/public/icons/`
- Pastikan path di manifest.json benar
- Pastikan icon size sesuai (192x192 dan 512x512)

### Aplikasi tidak bisa diinstall
- Pastikan HTTPS (atau localhost untuk development)
- Pastikan manifest valid
- Pastikan service worker terdaftar
- Pastikan icon tersedia

## Catatan Penting

1. **Development Mode**: PWA biasanya di-disable di development untuk memudahkan debugging
2. **HTTPS Required**: PWA memerlukan HTTPS di production (kecuali localhost)
3. **Service Worker**: Service worker hanya bekerja di production build
4. **Browser Support**: Tidak semua browser support PWA (terutama Safari iOS)

## Referensi

- [Next.js PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Checklist](https://web.dev/pwa-checklist/)

## Status Saat Ini

✅ **Persiapan Selesai** - Struktur file dan konfigurasi sudah siap
⚠️ **Menunggu**: 
- Install `next-pwa`
- Buat icon aplikasi
- Aktifkan konfigurasi

**Siap untuk implementasi PWA!** 🚀

