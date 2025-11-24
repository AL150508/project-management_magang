# Setup reCAPTCHA Sendiri & Disable Supabase Auth reCAPTCHA

## Masalah:
- reCAPTCHA Supabase Auth muncul dan tidak bisa diklik
- Aplikasi sudah punya reCAPTCHA sendiri yang overlap

## Solusi:

### ✅ Step 1: Disable reCAPTCHA dari Supabase Auth

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard

2. **Pilih Project** Anda

3. **Authentication** → **Settings** (atau **Providers**)

4. **Scroll ke bawah** cari section **"Bot and Abuse Protection"** atau **"CAPTCHA Protection"**

5. **Disable/Turn OFF** opsi:
   - ✅ **"Enable CAPTCHA protection"** → Set ke **OFF**
   - Atau set **"CAPTCHA threshold"** ke nilai tinggi (0.9)

6. **Save Changes**

7. **Refresh browser** dan coba login lagi

---

### ✅ Step 2: Setup Google reCAPTCHA Sendiri (Jika Belum Ada)

Aplikasi Anda sudah menggunakan Google reCAPTCHA v2. Berikut cara setup:

#### A. Dapatkan Site Key & Secret Key dari Google

1. **Buka Google reCAPTCHA Admin**:
   https://www.google.com/recaptcha/admin/create

2. **Login** dengan Google Account Anda

3. **Register a New Site**:
   - **Label**: "Management Magang Portal" (atau nama aplikasi Anda)
   - **reCAPTCHA type**: 
     - ✅ **reCAPTCHA v2** → "I'm not a robot" Checkbox
   - **Domains**: 
     - `localhost` (untuk development)
     - `yourdomain.com` (untuk production)
     - Contoh: `management-magang.vercel.app`
   - **Owners**: Email Anda
   - ✅ Accept Terms

4. **Submit**

5. **Copy Keys**:
   ```
   Site Key: 6LeXXXXXXXXXXXXXXXXXXXXXXXXX
   Secret Key: 6LeYYYYYYYYYYYYYYYYYYYYYYYYY
   ```

#### B. Konfigurasi Environment Variables

1. **Buka/Buat file** `.env.local` di root project:
   ```bash
   # d:\UBIG\Project\management_magang\.env.local
   ```

2. **Tambahkan reCAPTCHA Keys**:
   ```env
   # Google reCAPTCHA v2
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeXXXXXXXXXXXXXXXXXXXXXXXXX
   RECAPTCHA_SECRET_KEY=6LeYYYYYYYYYYYYYYYYYYYYYYYYY
   ```

   **Ganti** `6LeXXXX...` dengan **Site Key** Anda
   **Ganti** `6LeYYYY...` dengan **Secret Key** Anda

3. **Save file**

4. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

#### C. Verifikasi reCAPTCHA Berfungsi

1. **Buka aplikasi** → halaman Login

2. **Anda akan lihat reCAPTCHA** seperti ini:
   ```
   ┌─────────────────────────────┐
   │ ☑ I'm not a robot           │
   │    🔄                        │
   └─────────────────────────────┘
   ```

3. **Klik checkbox** → Jika muncul challenge (pilih gambar), selesaikan

4. **Checkbox berubah** menjadi ✅

5. **Button "Masuk"** sekarang aktif (tidak disabled)

6. **Login berhasil!**

---

### ✅ Step 3: Test Key untuk Development (Opsional)

Jika belum punya Google reCAPTCHA, gunakan **Test Key** sementara:

**Tambahkan di `.env.local`:**
```env
# Test Key (JANGAN PAKAI DI PRODUCTION!)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**⚠️ Warning:** Test key **SELALU BERHASIL** verifikasi. Jangan pakai di production!

---

### ✅ Step 4: Verifikasi di Console Browser

1. **Buka browser** → halaman Login

2. **Tekan F12** → Tab "Console"

3. **Lihat log reCAPTCHA**:
   ```
   🔍 reCAPTCHA Site Key: ✅ Using Production Key
   🔑 Site Key (first 20 chars): 6LeXXXXXXXXXXXXXXXXX...
   ```

4. **Klik checkbox reCAPTCHA**

5. **Console akan log**:
   ```
   ✅ reCAPTCHA verified: Success
   ```

---

## 🎯 Struktur Lengkap:

### File `.env.local` (Final)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google reCAPTCHA v2 (MILIK ANDA SENDIRI)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LeYYYYYYYYYYYYYYYYYYYYYYYYY
```

### Komponen reCAPTCHA (Sudah Ada)
- ✅ `src/components/recaptcha/recaptcha-wrapper.tsx`
- ✅ `src/components/auth/login-modal.tsx` (sudah terintegrasi)

---

## 🔒 Keamanan:

### reCAPTCHA Milik Anda (✅ Recommended)
```
User Login → Google reCAPTCHA v2 → Verifikasi di aplikasi Anda
```

**Keuntungan:**
- ✅ Anda yang kontrol
- ✅ Bisa customize tampilan
- ✅ Bisa lihat analytics di Google Admin
- ✅ Tidak conflict dengan Supabase

### reCAPTCHA Supabase (❌ Disable)
```
User Login → Supabase Auth reCAPTCHA → Conflict dengan reCAPTCHA Anda
```

**Masalah:**
- ❌ Overlap dengan reCAPTCHA Anda
- ❌ Tidak bisa diklik (z-index issue)
- ❌ User bingung (2 reCAPTCHA)

---

## 📝 Checklist:

- [ ] Disable reCAPTCHA di Supabase Dashboard
- [ ] Daftar Google reCAPTCHA di https://www.google.com/recaptcha/admin
- [ ] Copy Site Key & Secret Key
- [ ] Buat/Update file `.env.local` dengan keys
- [ ] Restart dev server (`npm run dev`)
- [ ] Test login dengan reCAPTCHA
- [ ] Verifikasi console log
- [ ] reCAPTCHA bisa diklik dan berfungsi

---

## 🆘 Troubleshooting:

### reCAPTCHA masih tidak muncul?
1. Pastikan `.env.local` ada dan berisi `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
2. Restart dev server
3. Clear browser cache (Ctrl+Shift+Del)
4. Cek console untuk error

### reCAPTCHA muncul tapi tidak bisa diklik?
1. Disable browser extensions (Ad blocker)
2. Coba browser lain
3. Pastikan Supabase reCAPTCHA sudah di-disable

### Button "Masuk" tetap disabled?
1. Klik checkbox reCAPTCHA terlebih dahulu
2. Pastikan checkbox berubah jadi ✅
3. Cek console untuk log `✅ reCAPTCHA verified: Success`

---

## 🎉 Hasil Akhir:

**Login Page dengan reCAPTCHA Milik Anda:**
```
┌─────────────────────────────────┐
│  Masuk ke akun Anda             │
│                                 │
│  Username: [_____________]      │
│  Password: [_____________] 👁️   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ✅ I'm not a robot       │   │
│  │    🔄                    │   │
│  └─────────────────────────┘   │
│                                 │
│  [→ Masuk]                      │
└─────────────────────────────────┘
```

**Tidak ada lagi:**
- ❌ reCAPTCHA Supabase yang overlap
- ❌ Modal reCAPTCHA yang tidak bisa diklik
- ❌ Confusion dengan 2 reCAPTCHA

Selamat! Sekarang Anda pakai **reCAPTCHA sendiri** yang full control! 🎊
