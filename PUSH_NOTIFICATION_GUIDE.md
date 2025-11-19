# 🔔 Push Notification Guide - Manajemen Magang

## Overview
Aplikasi ini menggunakan **Web Push Notifications** untuk memberikan notifikasi real-time kepada pengguna saat ada aktivitas penting.

## Format Notifikasi

### Tampilan Windows Notification
```
┌─────────────────────────────────┐
│ [M] Manajemen Magang            │ ← App name + icon
├─────────────────────────────────┤
│ Monday                          │ ← Timestamp (auto)
│                                 │
│ Pendaftaran Magang Baru         │ ← Title
│ sinta telah mendaftar magang    │ ← Body
│ di PT. Anugrah.                 │
│                                 │
│ via Microsoft Edge              │ ← Browser source
│ manajemen-magang.vercel.app     │ ← Domain
└─────────────────────────────────┘
```

## Event Triggers

### 1. Pendaftaran Magang Baru 📝
**Trigger:** Siswa mendaftar magang baru  
**Target:** Semua Guru  
**File:** `src/components/magang-modal.tsx`

```typescript
sendPushToRole('guru', {
  title: '📝 Pendaftaran Magang Baru',
  body: `${nama_siswa} telah mendaftar magang di ${nama_dudi}`,
  url: '/magang'
})
```

**Contoh Output:**
```
Title: 📝 Pendaftaran Magang Baru
Body: sinta telah mendaftar magang di PT. Anugrah.
```

---

### 2. Logbook Baru 📖
**Trigger:** Siswa submit logbook harian  
**Target:** Semua Guru  
**File:** `src/components/logbook-modal.tsx`

```typescript
sendPushToRole('guru', {
  title: '📖 Logbook Baru',
  body: `${nama_siswa} mengirim logbook: ${kegiatan.substring(0, 50)}...`,
  url: '/logbook'
})
```

**Contoh Output:**
```
Title: 📖 Logbook Baru
Body: fuji mengirim logbook: Melakukan maintenance server...
```

---

### 3. Nilai Magang 📊
**Trigger:** Guru memberikan nilai magang  
**Target:** Siswa tertentu  
**File:** `src/components/nilai-magang-modal.tsx`

```typescript
sendPushToUser(userId, {
  title: '📊 Nilai Magang Anda',
  body: `Nilai magang Anda: ${nilai}`,
  url: '/magang'
})
```

**Contoh Output:**
```
Title: 📊 Nilai Magang Anda
Body: Nilai magang Anda: 90
```

---

### 4. DUDI Baru 🏢
**Trigger:** DUDI baru didaftarkan  
**Target:** Semua Guru  
**File:** `src/components/dudi-registration-modal.tsx`

```typescript
sendPushToRole('guru', {
  title: '🏢 DUDI Baru Terdaftar',
  body: `DUDI baru: ${nama_dudi} di ${alamat}`,
  url: '/dudi'
})
```

**Contoh Output:**
```
Title: 🏢 DUDI Baru Terdaftar
Body: DUDI baru: PT. Anugrah di Malang
```

---

## Testing Guide

### Scenario 1: Test Logbook Notification

**Setup:**
1. Browser 1: Login sebagai **Guru**
   - Aktifkan notifications
   - Biarkan browser terbuka

2. Browser 2 (Incognito): Login sebagai **Siswa**
   - Go to Logbook page
   - Submit logbook baru

**Expected Result:**
- Browser 1 akan menerima notifikasi dalam 1-2 detik
- Notification muncul di Windows notification tray
- Click notification → redirect ke `/logbook`

---

### Scenario 2: Test Nilai Notification

**Setup:**
1. Browser 1: Login sebagai **Siswa**
   - Aktifkan notifications
   - Biarkan browser terbuka

2. Browser 2: Login sebagai **Guru**
   - Go to Magang page
   - Click "Nilai" pada siswa
   - Input nilai → Submit

**Expected Result:**
- Browser 1 (Siswa) menerima notifikasi nilai
- Notification shows nilai yang diberikan
- Click notification → redirect ke `/magang`

---

## Technical Details

### Service Worker
**File:** `public/sw-push.js`

```javascript
// Notification structure
{
  title: string,        // Notification title
  body: string,         // Notification body/message
  icon: string,         // App icon (192x192)
  badge: string,        // Badge icon
  tag: string,          // Notification tag
  vibrate: number[],    // Vibration pattern
  data: {
    url: string        // Click destination URL
  }
}
```

### Manifest Configuration
**File:** `public/manifest.json`

```json
{
  "name": "Manajemen Magang - SMK Brantas Karangkates",
  "short_name": "Manajemen Magang",  ← Display in notifications
  "icons": [
    {
      "src": "/icons/icon-192x192.png",  ← Notification icon
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ | ✅ | Full support |
| Edge | ✅ | ✅ | Full support |
| Firefox | ✅ | ⚠️ | Desktop only |
| Safari | ⚠️ | ❌ | Limited support |

---

## Permission Flow

```
1. User visits app
2. Click "Aktifkan Notifikasi" button
3. Browser permission popup appears
4. User clicks "Allow"
5. Service worker subscribes to push
6. Subscription saved to database
7. ✅ Ready to receive notifications
```

---

## Troubleshooting

### Notifications Not Appearing

**1. Check Permission:**
```javascript
console.log('Permission:', Notification.permission)
// Should return: "granted"
```

**2. Check Service Worker:**
- Open DevTools (F12)
- Go to Application → Service Workers
- Status should be: "activated and is running"

**3. Check Subscription:**
```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscribed:', !!sub)
  })
})
```

**4. Clear & Retry:**
1. Unregister service worker
2. Clear browser cache
3. Reload page
4. Subscribe again

---

## Production Deployment

### Environment Variables Required:
```env
VAPID_EMAIL=mailto:your-email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### Generate VAPID Keys:
```bash
npx web-push generate-vapid-keys
```

### Deployment Checklist:
- [ ] VAPID keys configured
- [ ] Icons (192x192, 512x512) uploaded
- [ ] Manifest.json configured
- [ ] Service worker deployed
- [ ] Test on production domain
- [ ] Verify notifications on mobile

---

## Best Practices

### 1. Notification Timing
- ✅ Send immediately after action
- ✅ Don't spam users
- ✅ Group similar notifications

### 2. Message Format
- ✅ Clear title (max 50 chars)
- ✅ Descriptive body (max 200 chars)
- ✅ Include actor name ("sinta telah...")
- ✅ Use emojis sparingly

### 3. Click Actions
- ✅ Always provide relevant URL
- ✅ Deep link to specific content
- ✅ Handle notification click properly

---

## API Reference

### Send to Role
```typescript
import { sendPushToRole } from '@/lib & database connection/send-push'

await sendPushToRole('guru', {
  title: 'Notification Title',
  body: 'Notification message',
  icon: '/icons/icon-192x192.png',
  url: '/target-page'
})
```

### Send to User
```typescript
import { sendPushToUser } from '@/lib & database connection/send-push'

await sendPushToUser(userId, {
  title: 'Notification Title',
  body: 'Notification message',
  icon: '/icons/icon-192x192.png',
  url: '/target-page'
})
```

---

## Status

✅ **PRODUCTION READY**

- [x] Service Worker configured
- [x] Push API integrated
- [x] Real-time notifications
- [x] Browser permission handling
- [x] Database subscription storage
- [x] Error handling & fallbacks
- [x] Windows notification support
- [x] Click action handling
- [x] Icon & badge display
- [x] Multiple event triggers

---

**Last Updated:** November 19, 2025  
**Version:** 1.0.0  
**Author:** Management Magang Team
