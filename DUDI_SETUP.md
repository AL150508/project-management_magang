# Setup Database untuk Halaman DUDI

## Tabel Database

### 1. Buat Tabel `dudi`

Jalankan SQL berikut di Supabase SQL Editor:

```sql
CREATE TABLE dudi (
  id SERIAL PRIMARY KEY,
  nama_perusahaan VARCHAR(255) NOT NULL,
  bidang_usaha VARCHAR(255) NOT NULL,
  alamat TEXT NOT NULL,
  pic VARCHAR(255) NOT NULL,
  kuota_magang INTEGER DEFAULT 0,
  kuota_terisi INTEGER DEFAULT 0,
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Insert Data Sample

```sql
INSERT INTO dudi (nama_perusahaan, bidang_usaha, alamat, pic, kuota_magang, kuota_terisi, deskripsi) VALUES
('PT Kreatif Teknologi', 'Teknologi Informasi', 'Jl. Merdeka No. 123, Jakarta', 'Andi Wijaya', 12, 8, 'Perusahaan teknologi yang bergerak dalam pengembangan aplikasi web dan mobile. Menyediakan program magang untuk mahasiswa IT dengan fokus pada full-stack development.'),
('CV Digital Solusi', 'Digital Marketing', 'Jl. Sudirman No. 45, Surabaya', 'Sari Dewi', 8, 5, 'Konsultan digital marketing yang membantu UMKM berkembang di era digital. Menyediakan program magang untuk mahasiswa marketing dan komunikasi.'),
('PT Inovasi Mandiri', 'Software Development', 'Jl. Diponegoro No. 78, Surabaya', 'Budi Santoso', 15, 12, 'Perusahaan software house yang mengembangkan sistem informasi untuk berbagai industri. Menawarkan program magang untuk mahasiswa teknik informatika dan sistem informasi.'),
('PT Teknologi Nusantara', 'Teknologi Informasi', 'Jl. HR Muhammad No. 123, Surabaya', 'Eddie Lake', 10, 6, 'Perusahaan teknologi yang fokus pada pengembangan aplikasi enterprise dan cloud computing.'),
('CV Digital Kreativa', 'Digital Marketing', 'Jl. Pemuda No. 45, Surabaya', 'Jamik Tashpulatov', 6, 3, 'Agen digital marketing yang membantu brand meningkatkan visibility online.'),
('PT Inovasi Mandiri', 'Konsultan IT', 'Jl. Diponegoro No. 78, Surabaya', 'Ahmad Rizki', 8, 5, 'Konsultan teknologi informasi yang membantu perusahaan dalam transformasi digital.');
```

## Fitur yang Tersedia

### ✅ **Halaman DUDI Siswa**
- Layout sesuai desain dengan search bar
- Grid kartu DUDI dengan informasi lengkap
- Progress bar kuota magang
- Status: Tersedia, Menunggu, Penuh
- Tombol daftar magang

### ✅ **Integrasi Data Real-time**
- Data DUDI diambil dari database yang sama dengan guru
- Ketika guru menambah DUDI baru, otomatis muncul di halaman siswa
- Real-time updates menggunakan Supabase

### ✅ **Search dan Filter**
- Search berdasarkan nama perusahaan, bidang usaha, lokasi
- Filter jumlah tampilan per halaman
- Responsive design

### ✅ **Status Management**
- **Tersedia** (hijau) - Masih ada slot kosong
- **Menunggu** (kuning) - Kuota hampir penuh (80%+)
- **Penuh** (merah) - Tidak ada slot kosong

## Cara Penggunaan

### 1. **Sebagai Siswa:**
- Buka halaman DUDI dari sidebar
- Gunakan search untuk mencari perusahaan
- Lihat detail perusahaan dan kuota magang
- Klik "Daftar Magang" untuk mendaftar

### 2. **Sebagai Guru:**
- Kelola data DUDI di halaman admin
- Tambah/edit/hapus perusahaan
- Set kuota magang dan PIC
- Data otomatis tersinkronisasi ke halaman siswa

## Status

Sistem DUDI sudah siap digunakan dengan integrasi real-time! 🎉

