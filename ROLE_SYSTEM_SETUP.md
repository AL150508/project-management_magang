# Sistem Role Siswa dan Guru

## 🎯 **Overview**

Sistem ini mendukung dua role utama:
- **👨‍🎓 Siswa**: Dashboard khusus dengan akses terbatas
- **👨‍🏫 Guru**: Dashboard admin dengan akses penuh ke semua fitur

## 🏗️ **Komponen yang Dibuat**

### **1. Student Header** (`student-header.tsx`)
- Logo "Magang Portal Siswa" dengan ikon topi wisuda
- Teks "SMK Negeri 1 Surabaya  Magang Siswa"
- Role selector (Siswa/Guru) di header
- Profil user dengan dropdown menu

### **2. Student Sidebar** (`student-sidebar.tsx`)
- Menu navigasi: Dashboard, DUDI, Magang, Logbook
- Layout compact dengan deskripsi singkat
- Active state dengan background biru
- Responsive design

### **3. Student Dashboard** (`student-dashboard.tsx`)
- Role selector di area konten
- Welcome message "Selamat datang, [Alvasya]!"
- Statistik logbook siswa
- Status magang dengan progress bar
- Aktivitas terbaru
- Layout sesuai desain yang diminta

### **4. Main Page** (`page.tsx`)
- Conditional rendering berdasarkan role
- Siswa: Layout dengan header dan sidebar khusus
- Guru: Layout admin dengan akses penuh

## 🎨 **Layout Siswa (Sesuai Desain)**

### **Header:**
```
[Logo] Magang Portal Siswa    SMK Brantas Karangkates...    [Siswa/Guru] [Profil]
```

### **Sidebar:**
```
📊 Dashboard
   Ringkasan aktivitas

🏢 DUDI
   Dunia Usaha & Industri

🎓 Magang
   Data magang saya

📝 Logbook
   Catatan harian
```

### **Dashboard Content:**
```
[Siswa] [Guru]  <- Role selector

Selamat datang, Ahmad Rizki!  <- Welcome message

[Stats Cards]  <- Total, Disetujui, Menunggu, Perlu Perbaikan

[Status Magang] [Aktivitas Terbaru]  <- Two column layout
```

## 🔄 **Fitur Role Switching**

### **Cara Kerja:**
1. User memilih role di header atau di area konten
2. Layout berubah secara dinamis
3. State role tersimpan di component state
4. Semua komponen menyesuaikan dengan role yang dipilih

### **Akses Berdasarkan Role:**

#### **👨‍🎓 Siswa:**
- ✅ Dashboard pribadi dengan statistik logbook
- ✅ Lihat data magang sendiri
- ✅ Tambah/edit logbook pribadi
- ✅ Lihat progress magang
- ❌ Tidak bisa akses data siswa lain
- ❌ Tidak bisa review logbook siswa lain

#### **👨‍🏫 Guru:**
- ✅ Dashboard admin dengan statistik global
- ✅ Akses semua data siswa
- ✅ Review dan approve/reject logbook
- ✅ Kelola data magang semua siswa
- ✅ Kelola data DUDI
- ✅ Akses penuh ke semua fitur

## 🚀 **Cara Penggunaan**

### **1. Buka Aplikasi**
```bash
npm run dev
```
Akses `http://localhost:3000`

### **2. Pilih Role**
- Klik tombol "Siswa" atau "Guru" di header
- Atau klik tombol di area konten dashboard

### **3. Navigasi**
- **Siswa**: Gunakan sidebar kiri untuk navigasi
- **Guru**: Gunakan sidebar admin yang sudah ada

## 📱 **Responsive Design**

- **Desktop**: Layout penuh dengan sidebar dan header
- **Tablet**: Sidebar collapse, header tetap
- **Mobile**: Hamburger menu untuk sidebar

## 🔧 **Customization**

### **Mengubah Nama User:**
Edit di `src/app/page.tsx`:
```typescript
const [userName] = React.useState("Nama Anda")
```

### **Mengubah Menu Sidebar:**
Edit di `src/components/student-sidebar.tsx`:
```typescript
const menuItems = [
  // Tambah/edit menu items
]
```

### **Mengubah Statistik Dashboard:**
Edit di `src/components/student-dashboard.tsx`:
```typescript
const studentStats = {
  // Ubah data statistik
}
```

## ✅ **Status Implementasi**

- ✅ Header dengan logo dan role selector
- ✅ Sidebar navigasi siswa
- ✅ Dashboard siswa dengan statistik
- ✅ Role switching functionality
- ✅ Responsive design
- ✅ Layout sesuai desain yang diminta

**Sistem role sudah siap digunakan!** 🎉
