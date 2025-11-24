# Cara Reset Password User

## Untuk User: rowop55150@etramay.com

### Metode 1: Reset via Supabase Dashboard

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih Project**: management_magang
3. **Klik "Authentication"** di sidebar kiri
4. **Klik "Users"**
5. **Cari user** dengan email: `rowop55150@etramay.com`
6. **Klik user** tersebut
7. **Klik "Send Password Reset Email"**
8. **Cek email** rowop55150@etramay.com
9. **Klik link** di email untuk reset password
10. **Set password baru**

### Metode 2: Update Password Manual via SQL (Admin Only)

Jika Anda adalah admin dan ingin set password langsung:

1. Buka **SQL Editor** di Supabase Dashboard
2. Jalankan query ini untuk update password user:

```sql
-- Reset password untuk user tertentu
-- Ganti 'PASSWORD_BARU_ANDA' dengan password yang diinginkan

-- PENTING: Ini hanya bisa dilakukan oleh admin Supabase!
UPDATE auth.users
SET encrypted_password = crypt('PASSWORD_BARU_ANDA', gen_salt('bf'))
WHERE email = 'rowop55150@etramay.com';
```

**Contoh:**
```sql
-- Set password menjadi "halomok12345"
UPDATE auth.users
SET encrypted_password = crypt('halomok12345', gen_salt('bf'))
WHERE email = 'rowop55150@etramay.com';
```

### Metode 3: Test Login untuk Verifikasi Password

Sebelum ubah password di aplikasi, **test login dulu** untuk tahu password yang benar:

1. **Logout** dari aplikasi
2. **Login** dengan email `rowop55150@etramay.com`
3. Coba password yang Anda ingat:
   - `12345678910`
   - `123456789`
   - `halomok12345`
   - atau password lain yang Anda ingat
4. **Yang berhasil login = password yang benar**

## ⚠️ Catatan Penting:

1. **Password TIDAK disimpan** di tabel `public.users`
2. **Password disimpan** di tabel internal `auth.users` (encrypted)
3. Kolom `password_hash` di `public.users` **TIDAK DIGUNAKAN** (bisa NULL)
4. Password **tidak bisa dilihat** dalam bentuk plaintext (untuk keamanan)
5. Hanya bisa **verify** (cek benar/salah) saat login

## 🔒 Lokasi Password Sebenarnya:

```
Supabase Project
└── Authentication
    └── Users
        └── auth.users (internal table)
            └── encrypted_password (hashed dengan bcrypt)
```

**TIDAK ADA** cara untuk "lihat" password asli. Hanya bisa:
- ✅ Verify (cek benar/salah saat login)
- ✅ Reset (kirim email reset)
- ✅ Update (ubah ke password baru)

## 📧 Email untuk Reset Password:

Jika memilih "Send Password Reset Email", email akan dikirim ke:
**rowop55150@etramay.com**

Pastikan email ini bisa Anda akses!
