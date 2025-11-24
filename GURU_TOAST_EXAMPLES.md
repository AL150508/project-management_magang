# 🎯 Guru Toast Examples

Toast khusus untuk aksi guru dengan **background putih** dan **text hitam**.

## 📦 Import

```typescript
import { showGuruAction } from "@/lib & database connection/utils"
```

---

## 🎨 Cara Pakai

### **Contoh 1: Verifikasi Logbook**

```typescript
// Di component logbook verification
const handleVerifikasi = async (id: string, status: string) => {
  try {
    // Update status di database
    await supabaseBrowser
      .from("logbook")
      .update({ status })
      .eq("id", id)

    // Toast guru action (white bg, black text)
    showGuruAction(
      `Logbook #${id.slice(0, 8)} berhasil di${status.toLowerCase()}`,
      "Verifikasi Logbook"
    )

  } catch (error) {
    showError("Gagal verifikasi logbook")
  }
}
```

**Result:**
```
Toast putih muncul dengan text:
"Verifikasi Logbook: Logbook #abc12345 berhasil disetujui"
```

---

### **Contoh 2: Approve Magang**

```typescript
const handleApproveMagang = async (magangId: string, namaS siswa: string) => {
  try {
    await supabaseBrowser
      .from("magang")
      .update({ status: "Disetujui" })
      .eq("id", magangId)

    // Toast guru action
    showGuruAction(
      `Pendaftaran magang ${namaSiswa} telah disetujui`,
      "Approve Magang"
    )

  } catch (error) {
    showError("Gagal approve magang")
  }
}
```

---

### **Contoh 3: Verifikasi DUDI**

```typescript
const handleVerifikasiDUDI = async (dudiId: string, perusahaan: string) => {
  try {
    await supabaseBrowser
      .from("dudi")
      .update({ verified: true })
      .eq("id", dudiId)

    // Toast guru action
    showGuruAction(
      `${perusahaan} telah diverifikasi sebagai mitra DUDI`,
      "Verifikasi DUDI"
    )

  } catch (error) {
    showError("Gagal verifikasi DUDI")
  }
}
```

---

### **Contoh 4: Delete Data**

```typescript
const handleDeleteLogbook = async (id: string) => {
  try {
    await supabaseBrowser
      .from("logbook")
      .delete()
      .eq("id", id)

    // Toast guru action
    showGuruAction(
      `Data logbook berhasil dihapus`,
      "Hapus Data"
    )

  } catch (error) {
    showError("Gagal menghapus logbook")
  }
}
```

---

### **Contoh 5: Update Data**

```typescript
const handleUpdateMagang = async (id: string, data: any) => {
  try {
    await supabaseBrowser
      .from("magang")
      .update(data)
      .eq("id", id)

    // Toast guru action
    showGuruAction(
      `Data magang berhasil diperbarui`,
      "Update Data"
    )

  } catch (error) {
    showError("Gagal update data")
  }
}
```

---

## 🎯 Use Cases untuk Guru Toast

Gunakan `showGuruAction()` untuk semua aksi guru:

### ✅ **Verifikasi**
- Verifikasi logbook (Disetujui/Ditolak)
- Verifikasi pendaftaran magang
- Verifikasi DUDI
- Verifikasi dokumen siswa

### ✅ **CRUD Operations**
- Create: Tambah data siswa, tambah DUDI, dll
- Update: Edit data magang, edit profil siswa
- Delete: Hapus logbook, hapus data magang

### ✅ **Approval**
- Approve/Reject pendaftaran magang
- Approve pembimbing
- Approve periode magang

---

## 🎨 Styling Toast Guru

Toast akan tampil dengan:
- **Background:** Putih (#ffffff)
- **Text:** Hitam (#111827)
- **Border:** Abu-abu tipis (#e5e7eb)
- **Font Weight:** Medium (500)
- **Duration:** 4 detik
- **Shadow:** Medium (shadow-lg)

---

## 📸 Preview

```
┌────────────────────────────────────────┐
│  Verifikasi Logbook:                   │
│  Logbook #abc12345 berhasil disetujui  │
└────────────────────────────────────────┘
     ↑
   White BG
   Black Text
```

---

## 🚀 Quick Integration

**File yang perlu diubah:**

1. **Logbook Verification:** `src/components/logbook-table.tsx`
2. **Magang Approval:** `src/components/guru/magang/table.tsx`
3. **DUDI Verification:** `src/components/dudi-cards.tsx`
4. **Delete Actions:** Semua component dengan delete button

**Ganti semua `showSuccess()` di aksi guru dengan `showGuruAction()`!**

---

## ✨ Benefit

- ✅ Konsisten untuk semua aksi guru
- ✅ Mudah dibedakan dari toast siswa (hijau/merah)
- ✅ Muncul di page guru DAN siswa
- ✅ Simple & clean design
- ✅ Auto-dismiss setelah 4 detik

**READY TO USE! 🎉**
