# ⚠️ PENTING: Icon Perlu Dibuat Manual

File icon `icon-192x192.png` dan `icon-512x512.png` perlu dibuat secara manual.

## Quick Solution untuk Testing

Untuk testing PWA, Anda bisa membuat icon sederhana dengan cara:

### Opsi 1: Online Generator (Paling Mudah)
1. Kunjungi: https://favicon.io/favicon-generator/
2. Masukkan text: "MP" (untuk Magang Portal)
3. Background: #2563eb (blue)
4. Text: White
5. Download dan simpan sebagai:
   - `icon-192x192.png` (resize ke 192x192)
   - `icon-512x512.png` (resize ke 512x512)
6. Simpan di folder `/public/icons/`

### Opsi 2: Convert dari SVG
1. Buat icon sederhana di Figma/Canva
2. Export sebagai SVG
3. Convert ke PNG 192x192 dan 512x512 menggunakan tool online
4. Simpan di `/public/icons/`

### Opsi 3: Gunakan Placeholder Sementara
Untuk testing, Anda bisa menggunakan icon placeholder dari:
- https://via.placeholder.com/192x192/2563eb/ffffff?text=MP
- https://via.placeholder.com/512x512/2563eb/ffffff?text=MP

Download dan simpan sebagai `icon-192x192.png` dan `icon-512x512.png`

## Setelah Icon Dibuat

Pastikan file berikut ada:
- ✅ `/public/icons/icon-192x192.png`
- ✅ `/public/icons/icon-512x512.png`

Setelah itu, build aplikasi dan test PWA.

