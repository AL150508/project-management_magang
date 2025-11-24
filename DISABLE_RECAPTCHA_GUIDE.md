# Cara Disable reCAPTCHA di Supabase

## Masalah:
reCAPTCHA muncul saat login tapi tidak bisa diklik/dipilih.

## Solusi: Disable reCAPTCHA di Supabase Dashboard

### Step-by-Step:

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard

2. **Pilih Project**: management_magang

3. **Klik "Authentication"** di sidebar kiri

4. **Klik "Providers"**

5. **Scroll ke bawah** hingga menemukan **"Security"** atau **"CAPTCHA"**

6. **Disable reCAPTCHA** dengan:
   - Toggle OFF untuk "Enable reCAPTCHA protection"
   - Atau set "reCAPTCHA threshold" ke nilai tinggi (seperti 0.9)

7. **Save Changes**

8. **Refresh halaman login** dan coba login lagi

## Alternatif: Fix CSS Issue

Jika ingin tetap pakai reCAPTCHA, tambahkan CSS fix:

```css
/* Fix reCAPTCHA z-index issue */
iframe[src*="recaptcha"] {
  z-index: 9999 !important;
  pointer-events: auto !important;
}

.grecaptcha-badge {
  z-index: 9999 !important;
}
```

## Alternatif 2: Disable untuk Development Only

Di Supabase Dashboard:
- Authentication → Settings
- Scroll ke "Security and Auth"
- Enable "Disable email confirmations" (untuk development)
- Set "CAPTCHA threshold" ke 0.9 (hanya trigger untuk suspicious traffic)

## Kenapa reCAPTCHA Muncul?

Supabase menggunakan reCAPTCHA untuk:
1. Mencegah bot/spam
2. Proteksi dari brute force attack
3. Rate limiting

Untuk **development/testing**, biasanya aman untuk disable.
Untuk **production**, sebaiknya tetap aktif tapi dengan threshold yang reasonable.
