-- Script aman untuk menambahkan kolom yang mungkin kurang di tabel magang
-- Script ini menggunakan IF NOT EXISTS sehingga aman dijalankan berulang kali
-- Sesuai dengan referensi: Siswa = user.id (UUID), bukan nama siswa

-- Tambahkan kolom dengan huruf kapital (jika belum ada)
-- Siswa akan berisi user.id dari Supabase Auth (UUID)
ALTER TABLE public.magang 
ADD COLUMN IF NOT EXISTS "Siswa" uuid,
ADD COLUMN IF NOT EXISTS "NIS" text,
ADD COLUMN IF NOT EXISTS "Kelas" text,
ADD COLUMN IF NOT EXISTS "Jurusan" text,
ADD COLUMN IF NOT EXISTS "DUDI" text,
ADD COLUMN IF NOT EXISTS "Mulai" date,
ADD COLUMN IF NOT EXISTS "Selesai" date,
ADD COLUMN IF NOT EXISTS "Status" text DEFAULT 'Pending';

-- Tambahkan kolom snake_case (jika belum ada)
-- nama_siswa juga akan berisi user.id dari Supabase Auth (UUID)
ALTER TABLE public.magang 
ADD COLUMN IF NOT EXISTS nama_siswa uuid,
ADD COLUMN IF NOT EXISTS nis text,
ADD COLUMN IF NOT EXISTS kelas text,
ADD COLUMN IF NOT EXISTS jurusan text,
ADD COLUMN IF NOT EXISTS nama_dudi text,
ADD COLUMN IF NOT EXISTS nama_perusahaan text,
ADD COLUMN IF NOT EXISTS dudi_id integer,
ADD COLUMN IF NOT EXISTS periode_mulai date,
ADD COLUMN IF NOT EXISTS periode_selesai date,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending';

-- Tambahkan kolom created_at jika belum ada
ALTER TABLE public.magang 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Refresh schema cache agar Supabase mengenali kolom baru
SELECT pg_notify('pgrst', 'reload schema');

-- Tampilkan struktur tabel setelah update
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'magang'
ORDER BY ordinal_position;
