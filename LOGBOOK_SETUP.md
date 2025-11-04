# Setup Database untuk Halaman Logbook

## Tabel Database

### 1. Buat Tabel `logbook`

Jalankan SQL berikut di Supabase SQL Editor:

```sql
CREATE TABLE logbook (
  id SERIAL PRIMARY KEY,
  nama_siswa VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL,
  kegiatan TEXT NOT NULL,
  kendala TEXT,
  status VARCHAR(20) DEFAULT 'Belum Diverifikasi',
  catatan_guru TEXT,
  catatan_dudi TEXT,
  foto VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Insert Data Sample

```sql
INSERT INTO logbook (nama_siswa, tanggal, kegiatan, kendala, status, catatan_guru, catatan_dudi) VALUES
('Ahmad Rizki', '2024-03-01', 'Membuat desain UI aplikasi kasir menggunakan Figma. Melakukan analisis kebutuhan dan wireframing untuk interface yang user-friendly.', 'Kesulitan menentukan skema warna yang tepat dan konsisten untuk seluruh aplikasi', 'Disetujui', 'Bagus, lanjutkan dengan implementasi', 'Desain sudah sesuai dengan brief yang diberikan'),
('Ahmad Rizki', '2024-03-02', 'Belajar backend Laravel dan implementasi API untuk sistem kasir. Membuat migration database dan model Eloquent.', 'Error saat menjalankan migration database karena konflik dengan versi PHP', 'Belum Diverifikasi', '', ''),
('Siti Nurhaliza', '2024-03-01', 'Setup server Linux Ubuntu untuk deployment aplikasi. Konfigurasi Nginx dan SSL certificate.', 'Kesulitan mengkonfigurasi reverse proxy untuk multiple domain', 'Ditolak', 'Perbaiki deskripsi kegiatan dan tambahkan detail teknis', 'Perlu penjelasan lebih detail tentang konfigurasi yang dilakukan');
```

## Fitur yang Tersedia

### ✅ **Tabel Logbook**
- Tampilan tabel dengan layout sesuai contoh
- Kolom: Siswa & Tanggal, Kegiatan & Kendala, Status, Catatan (Guru & DUDI), Aksi
- Search dan filter berdasarkan nama siswa, kegiatan, dan status
- Pagination untuk performa yang baik

### ✅ **Status Management**
- **Disetujui** (hijau) - Logbook sudah disetujui
- **Ditolak** (merah) - Logbook ditolak dan perlu perbaikan
- **Belum Diverifikasi** (kuning) - Menunggu review guru

### ✅ **Modal Review untuk Guru**
- Mode **Add**: Tambah logbook baru (untuk siswa)
- Mode **Edit**: Edit logbook yang sudah ada
- Mode **Review**: Guru memberikan catatan dan mengubah status

### ✅ **Dashboard Integration**
- Statistik real-time di dashboard
- Komponen logbook terbaru di dashboard
- Real-time updates menggunakan Supabase subscriptions

### ✅ **Responsive Design**
- Layout responsive untuk mobile dan desktop
- Loading states dan error handling
- Toast notifications untuk feedback

## Cara Penggunaan

### 1. **Sebagai Siswa:**
- Klik "Tambah Logbook" untuk menambah logbook baru
- Isi kegiatan dan kendala yang dihadapi
- Upload foto kegiatan (opsional)

### 2. **Sebagai Guru:**
- Klik tombol "View" (mata) untuk review logbook
- Berikan catatan dan pilih status (Disetujui/Ditolak/Belum Diverifikasi)
- Klik tombol "Edit" untuk mengubah data logbook

### 3. **Filter dan Search:**
- Gunakan search box untuk mencari berdasarkan nama siswa atau kegiatan
- Gunakan dropdown status untuk filter berdasarkan status
- Data akan ter-update real-time

## Status

Sistem logbook sudah siap digunakan dengan semua fitur yang diminta! 🎉
