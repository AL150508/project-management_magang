# 🔐 Setup reCAPTCHA & Email Reset Password

## ✅ STATUS IMPLEMENTASI

**reCAPTCHA:** ✅ Sudah terimplementasi di Login, Register, Forgot Password  
**Email Reset:** ✅ Sudah terimplementasi (Supabase built-in email)

---

## 📋 Prerequisites

### 1. Google reCAPTCHA v2 Keys (OPSIONAL)

**CATATAN:** reCAPTCHA component sudah ada fallback ke Google Test Key jika tidak di-configure.

Untuk production, dapatkan keys dari: https://www.google.com/recaptcha/admin/create

**Pilih reCAPTCHA v2 → "I'm not a robot" Checkbox**

Tambahkan domain:
- `localhost` (untuk development)
- `yourdomain.com` (untuk production)

### 2. Environment Variables

Tambahkan ke `.env.local` (OPSIONAL untuk production):

```env
# reCAPTCHA Keys (Opsional - sudah ada fallback ke test key)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

**Tanpa key ini, sistem tetap jalan dengan Google Test Key untuk development.**

---

## ⚙️ Supabase Configuration untuk Email Reset Password

### 1. Email Templates (Supabase Dashboard)

**Go to:** Supabase Dashboard → Authentication → Email Templates

**Template: Reset Password (Recovery)**

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>Follow this link to reset your password for your Management Magang account:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't ask to reset your password, you can ignore this email.</p>
<p>Thanks,<br>Management Magang Team</p>
```

### 2. Redirect URLs

**Go to:** Supabase Dashboard → Authentication → URL Configuration

**Add Redirect URLs:**
```
http://localhost:3000/auth/reset-password
https://yourdomain.com/auth/reset-password
```

### 3. SMTP Settings (Optional - untuk custom email)

**Default:** Supabase sudah provide email sender gratis (limited 3 emails/hour di free tier)

**Untuk production dengan unlimited emails:**

**Go to:** Supabase Dashboard → Project Settings → Auth → SMTP Settings

**Enable Custom SMTP:**
- Host: `smtp.gmail.com` (atau SMTP provider lain)
- Port: `587`
- Username: `your-email@gmail.com`
- Password: `app-specific-password`
- Sender email: `your-email@gmail.com`
- Sender name: `Management Magang`

**Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password
4. Use that password for SMTP

### 4. Email Rate Limiting

**Go to:** Supabase Dashboard → Authentication → Rate Limits

**Recommended Settings:**
- Email sent per hour: 10 (free tier default: 3)
- Require email confirmation: Enabled
- Secure password change: Enabled

---

## 🧪 Testing

### Test reCAPTCHA:
1. Run `npm run dev`
2. Open login/register/forgot password modal
3. Try submit without clicking reCAPTCHA → Should block
4. Click reCAPTCHA → Should allow submit

### Test Email Reset:
1. Click "Lupa password?"
2. Enter email
3. Click "Kirim Link Reset"
4. Check email inbox
5. Click link di email
6. Redirect ke `/auth/reset-password`
7. Enter new password
8. Success!

---

## 🚀 Implementation Files

### Files yang akan dibuat/diubah:
1. `src/components/auth/login-modal.tsx` - Add reCAPTCHA
2. `src/components/auth/register-modal.tsx` - Add reCAPTCHA
3. `src/components/auth/forgot-password-modal.tsx` - Add reCAPTCHA + email flow
4. `src/app/auth/reset-password/page.tsx` - New page untuk reset password
5. `src/lib & database connection/recaptcha.ts` - Helper functions

---

## 📝 Notes

**reCAPTCHA v2 vs v3:**
- **v2 (Checkbox)**: User harus klik "I'm not a robot" ✅ (Recommended untuk login)
- **v3 (Invisible)**: Scoring based, no user interaction

**Email Limits:**
- **Free Tier**: 3 emails/hour, 30/day
- **Pro Tier**: 100 emails/hour, 1000/day
- **Custom SMTP**: Unlimited (depends on your SMTP provider)

**Security Tips:**
- Jangan expose `RECAPTCHA_SECRET_KEY` di client-side
- Verify reCAPTCHA token di server-side API route
- Set rate limiting untuk forgot password endpoint

---

## 🚀 Quick Start Guide untuk Supabase Email

### Step-by-Step Configuration:

**1. Buka Supabase Dashboard**
- Go to: https://supabase.com/dashboard
- Pilih project Anda
- Sidebar → Authentication

**2. Configure Redirect URLs**
```
Authentication → URL Configuration → Redirect URLs
```
Tambahkan URL:
- `http://localhost:3000/auth/reset-password` (development)
- `https://your-domain.com/auth/reset-password` (production)

**3. Test Email Reset Flow**

a. Development (Local):
```bash
npm run dev
```

b. Klik "Lupa password?" di login modal

c. Masukkan email yang terdaftar

d. Click reCAPTCHA ✅

e. Klik "Kirim Link Reset"

f. **Check email inbox** (atau spam folder)

g. Klik link di email

h. Redirect ke `/auth/reset-password`

i. Masukkan password baru

j. Success! Login dengan password baru

**4. Troubleshooting**

**Email tidak terkirim?**
- Check Supabase email quota (3/hour di free tier)
- Verify email di Supabase dashboard → Authentication → Users
- Check spam folder
- Pastikan redirect URL sudah ditambahkan

**Error "Invalid redirect URL"?**
- Pastikan URL di redirect URLs config EXACT sama dengan `redirectTo` di code
- Format: `http://localhost:3000/auth/reset-password` (no trailing slash)

**reCAPTCHA tidak muncul?**
- Check console untuk error
- Pastikan `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` di `.env.local`
- Atau gunakan test key (sudah ada fallback)

---

## 📊 Implementation Summary

### Files yang Sudah Dibuat/Dimodifikasi:

1. ✅ `src/components/auth/login-modal.tsx` - reCAPTCHA implemented
2. ✅ `src/components/auth/register-modal.tsx` - reCAPTCHA implemented
3. ✅ `src/components/auth/forgot-password-modal.tsx` - reCAPTCHA + Email reset implemented
4. ✅ `src/app/auth/reset-password/page.tsx` - Reset password page (NEW)
5. ✅ `src/components/recaptcha/recaptcha-wrapper.tsx` - reCAPTCHA wrapper component

### Flow Diagram:

```
User clicks "Lupa password?"
        ↓
Enter email + verify reCAPTCHA
        ↓
Click "Kirim Link Reset"
        ↓
Supabase sends email
        ↓
User clicks link in email
        ↓
Redirect to /auth/reset-password
        ↓
Enter new password
        ↓
Password updated in Supabase Auth
        ↓
Redirect to login
        ↓
Login with new password ✅
```

### Security Features:

- ✅ reCAPTCHA v2 protection on all auth forms
- ✅ Password validation (min 6 chars)
- ✅ Confirm password matching
- ✅ Supabase secure token in reset link
- ✅ Auto-expiring reset tokens
- ✅ Clear form on success/error
- ✅ Reset reCAPTCHA on error

### User Experience:

- ✅ Clear success/error messages
- ✅ Loading states with spinner
- ✅ Password visibility toggle
- ✅ Auto-redirect after success
- ✅ Toast notifications
- ✅ Responsive design

---

## ✅ READY TO USE!

Sistem reCAPTCHA dan Email Reset Password sudah siap digunakan.

**Testing Checklist:**
- [ ] Test reCAPTCHA di login modal
- [ ] Test reCAPTCHA di register modal
- [ ] Test forgot password flow
- [ ] Test email received
- [ ] Test reset password page
- [ ] Test login dengan password baru

**Production Checklist:**
- [ ] Add production reCAPTCHA keys to `.env.local`
- [ ] Add production redirect URL to Supabase
- [ ] Configure custom SMTP (optional)
- [ ] Test email delivery
- [ ] Monitor email quota

Status: 100% Complete ✅
