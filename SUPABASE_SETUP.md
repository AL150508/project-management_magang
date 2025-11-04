# Setup Supabase untuk Management Magang

## Langkah-langkah Setup

### 1. Buat File .env.local
Buat file `.env.local` di root project dengan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Dapatkan Credentials dari Supabase
1. Buka [supabase.com](https://supabase.com)
2. Login atau daftar akun
3. Buat project baru
4. Pergi ke Settings > API
5. Copy URL dan anon key

### 3. Setup Database Tables
Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Tabel magang
CREATE TABLE IF NOT EXISTS magang (
  id SERIAL PRIMARY KEY,
  nama_siswa VARCHAR(255) NOT NULL,
  nis VARCHAR(50),
  kelas VARCHAR(50),
  jurusan VARCHAR(100),
  nama_dudi VARCHAR(255) NOT NULL,
  alamat_perusahaan TEXT,
  periode_mulai DATE,
  periode_selesai DATE,
  status VARCHAR(50) DEFAULT 'Pending',
  nilai INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel logbook
CREATE TABLE IF NOT EXISTS logbook (
  id SERIAL PRIMARY KEY,
  nama_siswa VARCHAR(255) NOT NULL,
  kegiatan TEXT NOT NULL,
  tanggal DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Belum Diverifikasi',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel dudi
CREATE TABLE IF NOT EXISTS dudi (
  id SERIAL PRIMARY KEY,
  nama_perusahaan VARCHAR(255) NOT NULL,
  bidang_usaha VARCHAR(255),
  alamat TEXT,
  kontak VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel magang_guru (untuk persetujuan)
CREATE TABLE IF NOT EXISTS magang_guru (
  id SERIAL PRIMARY KEY,
  nama_siswa VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telepon VARCHAR(50),
  alamat TEXT,
  motivasi TEXT,
  pengalaman TEXT,
  nama_dudi VARCHAR(255) NOT NULL,
  bidang_usaha VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Pending',
  catatan_guru TEXT,
  tanggal_pendaftaran TIMESTAMP DEFAULT NOW(),
  tanggal_persetujuan TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Insert Sample Data
```sql
-- Sample data magang
INSERT INTO magang (nama_siswa, nis, kelas, jurusan, nama_dudi, alamat_perusahaan, periode_mulai, periode_selesai, status, nilai) VALUES
('Ahmad Rizki', '2024001', 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Kreatif Teknologi', 'Jakarta', '2024-02-01', '2024-05-01', 'Aktif', 88);

-- Sample data dudi
INSERT INTO dudi (nama_perusahaan, bidang_usaha, alamat, kontak) VALUES
('PT Kreatif Teknologi', 'Teknologi Informasi', 'Jakarta', 'info@kreatiftech.com'),
('PT Digital Solutions', 'Software Development', 'Surabaya', 'contact@digitalsol.com');

-- Sample data logbook
INSERT INTO logbook (nama_siswa, kegiatan, tanggal, status) VALUES
('Ahmad Rizki', 'Belajar React dan Next.js', '2024-02-01', 'Disetujui'),
('Ahmad Rizki', 'Membuat komponen UI', '2024-02-02', 'Disetujui');
```

### 5. Restart Development Server
```bash
npm run dev
```

## Troubleshooting

### Error "Supabase is not configured"
- Pastikan file `.env.local` sudah dibuat
- Pastikan credentials Supabase sudah benar
- Restart development server

### Error "Internal Server Error"
- Periksa koneksi internet
- Pastikan Supabase project aktif
- Periksa credentials di `.env.local`

### Data tidak muncul
- Pastikan tabel sudah dibuat di Supabase
- Periksa nama tabel dan kolom sesuai dengan kode
- Pastikan data sudah di-insert ke database