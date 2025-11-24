-- ============================================
-- LOGBOOK USER_ID MIGRATION
-- ============================================
-- Script untuk menambah kolom user_id ke tabel logbook
-- dan migrate data yang sudah ada

-- Step 1: Tambah kolom user_id
ALTER TABLE logbook 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Step 2: Tambah index untuk performa
CREATE INDEX IF NOT EXISTS idx_logbook_user_id ON logbook(user_id);

-- ============================================
-- Step 3: UPDATE LOGBOOK EXISTING DATA
-- ============================================
-- PENTING: Ganti 'YOUR-USER-ID-HERE' dengan UUID user Anda

-- Cara cek user_id Anda:
-- SELECT id, email, full_name, username FROM users WHERE email = 'alvasyarpl1@gmail.com';

-- Setelah dapat user_id, uncomment dan jalankan query ini:

-- Update logbook untuk user Alvasya
-- UPDATE logbook 
-- SET user_id = 'YOUR-USER-ID-HERE'
-- WHERE nama_siswa IN ('Alvasya', 'alvasya_RPL1', 'alvasya', 'ALVASYA');

-- ============================================
-- VERIFIKASI
-- ============================================
-- Cek hasil update:
-- SELECT 
--   id, 
--   nama_siswa, 
--   user_id, 
--   kegiatan,
--   tanggal
-- FROM logbook 
-- ORDER BY tanggal DESC;

-- Cek berapa logbook per user:
-- SELECT 
--   u.email,
--   u.full_name,
--   COUNT(l.id) as total_logbook
-- FROM users u
-- LEFT JOIN logbook l ON l.user_id = u.id
-- GROUP BY u.id, u.email, u.full_name
-- ORDER BY total_logbook DESC;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Setelah migration, semua logbook BARU akan otomatis dapat user_id
-- 2. Filter di UI akan prioritize user_id (lebih akurat)
-- 3. Nama siswa bisa berubah-ubah, tapi user_id tetap
-- 4. Backward compatible: jika user_id null, fallback ke nama
