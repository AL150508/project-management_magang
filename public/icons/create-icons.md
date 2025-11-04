# Instruksi Membuat Icon Aplikasi

Icon placeholder sudah dibuat, tetapi untuk production, silakan buat icon yang lebih profesional.

## Icon yang Diperlukan

1. `icon-192x192.png` - 192x192 pixels
2. `icon-512x512.png` - 512x512 pixels

## Cara Membuat Icon

### Opsi 1: Online Tool (Recommended)
1. Kunjungi [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) atau
2. Kunjungi [Favicon.io](https://favicon.io/) atau
3. Kunjungi [RealFaviconGenerator](https://realfavicongenerator.net/)

4. Upload logo/icon aplikasi Anda (minimal 512x512 pixels)
5. Generate icon dalam berbagai ukuran
6. Download icon 192x192 dan 512x512
7. Simpan di folder `/public/icons/`

### Opsi 2: Manual dengan Design Tool
1. Buat icon dengan ukuran 512x512 pixels di Figma/Photoshop/Canva
2. Export sebagai PNG
3. Resize ke 192x192 untuk icon kecil
4. Simpan sebagai `icon-192x192.png` dan `icon-512x512.png`
5. Simpan di folder `/public/icons/`

### Opsi 3: Gunakan Icon Generator
1. Buat icon sederhana dengan text "MP" (Magang Portal)
2. Background: Blue (#2563eb)
3. Text: White
4. Export dalam ukuran 192x192 dan 512x512

## Catatan

Icon placeholder saat ini adalah icon sederhana. Untuk production, pastikan icon:
- Jelas dan mudah dikenali
- Sesuai dengan brand aplikasi
- Memiliki kontras yang baik
- Tidak blur saat di-resize

