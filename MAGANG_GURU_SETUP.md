# Setup Database untuk Sistem Persetujuan Magang

## Tabel Database

### 1. Buat Tabel `magang_guru`

Jalankan SQL berikut di Supabase SQL Editor:

```sql
CREATE TABLE magang_guru (
  id SERIAL PRIMARY KEY,
  nama_siswa VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telepon VARCHAR(20) NOT NULL,
  alamat TEXT,
  motivasi TEXT NOT NULL,
  pengalaman TEXT,
  nama_dudi VARCHAR(255) NOT NULL,
  bidang_usaha VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Pending',
  catatan_guru TEXT,
  tanggal_pendaftaran TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tanggal_persetujuan TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Buat Tabel `magang` (jika belum ada)

```sql
CREATE TABLE magang (
  id SERIAL PRIMARY KEY,
  nama_siswa VARCHAR(255) NOT NULL,
  nis VARCHAR(50),
  kelas VARCHAR(100),
  jurusan VARCHAR(100),
  nama_dudi VARCHAR(255) NOT NULL,
  bidang_usaha VARCHAR(255),
  periode_mulai DATE,
  periode_selesai DATE,
  status VARCHAR(20) DEFAULT 'Aktif',
  nilai INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Insert Data Sample untuk Testing

```sql
-- Data sample untuk magang_guru (pendaftaran yang menunggu persetujuan)
INSERT INTO magang_guru (nama_siswa, email, telepon, alamat, motivasi, pengalaman, nama_dudi, bidang_usaha, status) VALUES
('Ahmad Rizki', 'ahmad@email.com', '081234567890', 'Jl. Merdeka No. 123', 'Ingin belajar pengembangan aplikasi web modern', 'Pernah membuat website sederhana dengan HTML/CSS', 'PT. Teknologi Nusantara', 'Teknologi Informasi', 'Pending'),
('Siti Nurhaliza', 'siti@email.com', '081234567891', 'Jl. Sudirman No. 45', 'Tertarik dengan digital marketing dan social media', 'Mengelola akun Instagram bisnis keluarga', 'CV. Digital Kreativa', 'Digital Marketing', 'Pending'),
('Budi Santoso', 'budi@email.com', '081234567892', 'Jl. Diponegoro No. 78', 'Ingin mendalami network security dan server administration', 'Pernah setup jaringan kecil di sekolah', 'PT. Inovasi Mandiri', 'Konsultan IT', 'Pending');
```

## Workflow Sistem

### 1. **Pendaftaran Siswa**
- Siswa mengisi form pendaftaran magang
- Data disimpan ke tabel `magang_guru` dengan status "Pending"
- Guru mendapat notifikasi ada pendaftaran baru

### 2. **Persetujuan Guru**
- Guru melihat daftar pendaftaran di halaman khusus
- Guru bisa approve atau reject pendaftaran
- Jika approve: data dipindah ke tabel `magang` dengan status "Aktif"
- Jika reject: status di `magang_guru` menjadi "Ditolak"

### 3. **Status Management**
- **Pending**: Menunggu persetujuan guru
- **Disetujui**: Sudah disetujui, data dipindah ke tabel magang
- **Ditolak**: Ditolak oleh guru

## Fitur yang Akan Dibuat

- ✅ Form pendaftaran siswa
- ✅ Halaman persetujuan untuk guru
- ✅ Sistem approve/reject
- ✅ Notifikasi status pendaftaran
- ✅ History pendaftaran siswa
