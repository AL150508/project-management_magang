"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconBuilding } from "@tabler/icons-react"
import { showSuccess, showError } from "@/lib & database connection/utils"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { DudiItem } from "./dudi-cards"

interface DudiRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dudi: DudiItem | null
  onSuccess?: () => void
}

export function DudiRegistrationModal({ 
  open, 
  onOpenChange, 
  dudi, 
  onSuccess 
}: DudiRegistrationModalProps) {
  const [formData, setFormData] = React.useState({
    nama: "",
    nis: "",
    kelas: "",
    jurusan: "",
    email: "",
    telepon: "",
    alamat: "",
    motivasi: "",
    pengalaman: "",
    periode_mulai: "",
    periode_selesai: ""
  })
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setFormData({
        nama: "",
        nis: "",
        kelas: "",
        jurusan: "",
        email: "",
        telepon: "",
        alamat: "",
        motivasi: "",
        pengalaman: "",
        periode_mulai: "",
        periode_selesai: ""
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dudi) return

    setLoading(true)
    try {
      console.log("🚀 Form DUDI submit dimulai...")
      console.log("📝 Form data yang diterima:", formData)
      console.log("🏢 DUDI yang dipilih:", dudi)
      
      // Loading state sudah dihandle oleh setLoading(true)
      
      // Validate form data
      if (!formData.nama || !formData.email || !formData.telepon || !formData.motivasi) {
        console.error("❌ Validasi gagal - field kosong")
        console.log("- Nama:", formData.nama)
        console.log("- Email:", formData.email)
        console.log("- Telepon:", formData.telepon)
        console.log("- Motivasi:", formData.motivasi)
        showError("Mohon lengkapi semua field yang wajib diisi")
        return
      }
      
      console.log("✅ Validasi form berhasil")

      // Save directly to magang table (opsi 1)
      if (!supabaseBrowser) {
        showError("Database tidak tersedia")
        return
      }

      // First check if table exists by trying to select from it
      const { error: checkError } = await supabaseBrowser
        .from("magang")
        .select("id")
        .limit(1)

      if (checkError && checkError.code === 'PGRST116') {
        showError("Tabel magang_guru belum dibuat. Silakan jalankan SQL setup terlebih dahulu.")
        return
      }

      // Dapatkan user ID dari Supabase Auth (dengan fallback)
      console.log("🔍 Mendapatkan user dari Supabase Auth...")
      const { data: { user } } = await supabaseBrowser.auth.getUser()
      console.log("👤 User data:", user)
      
      // Gunakan nama siswa sebagai identifier, bukan UUID
      let studentName = formData.nama?.trim() || user?.fullName || "Siswa"
      if (!studentName || studentName === "null" || studentName === "undefined") {
        console.log("⚠️ Nama siswa kosong, menggunakan fallback")
        studentName = "Siswa_" + Date.now()
      }
      
      console.log("✅ Student Name:", studentName)

      // Validasi data yang diperlukan
      console.log("📝 Form data:", formData)
      console.log("🏢 DUDI data:", dudi)
      
      const nisSiswa = formData.nis?.trim() || ""
      const kelasSiswa = formData.kelas?.trim() || ""
      const jurusanSiswa = formData.jurusan?.trim() || ""
      const namaPerusahaan = dudi.nama_perusahaan?.trim() || "Perusahaan"
      
      console.log("🔧 Data yang akan di-insert:")
      console.log("- Student Name:", studentName)
      console.log("- NIS:", nisSiswa)
      console.log("- Kelas:", kelasSiswa)
      console.log("- Jurusan:", jurusanSiswa)
      console.log("- Nama Perusahaan:", namaPerusahaan)
      
      // Validasi final - pastikan tidak ada yang null
      if (!studentName || studentName === "null" || studentName === "undefined") {
        console.error("❌ Student name masih null setelah validasi")
        showError("Terjadi kesalahan dalam validasi data")
        return
      }

      // Payload utama: kolom kapital sesuai pembacaan tabel Magang
      const payloadCaps = {
        Siswa: studentName,
        NIS: nisSiswa || null,
        Kelas: kelasSiswa || null,
        Jurusan: jurusanSiswa || null,
        DUDI: namaPerusahaan,
        Mulai: formData.periode_mulai || null,
        Selesai: formData.periode_selesai || null,
        Status: "Pending"
      }

      // Fallback snake_case jika gagal karena kolom tidak cocok
      const payloadSnake = {
        nama_siswa: studentName,
        nis: nisSiswa || null,
        kelas: kelasSiswa || null,
        jurusan: jurusanSiswa || null,
        nama_dudi: namaPerusahaan,
        periode_mulai: formData.periode_mulai || null,
        periode_selesai: formData.periode_selesai || null,
        status: "Pending"
      }

      // Coba insert payloadCaps terlebih dahulu
      const firstTry = await supabaseBrowser
        .from("magang")
        .insert([payloadCaps])

      if (firstTry.error) {
        console.log("❌ Insert payloadCaps gagal:", firstTry.error)
        // Coba fallback ke snake_case
        const secondTry = await supabaseBrowser
          .from("magang")
          .insert([payloadSnake])
        if (secondTry.error) {
          console.log("❌ Insert payloadSnake juga gagal:", secondTry.error)
          const errorObj = secondTry.error as { code?: string; message?: string }
          if (errorObj?.code === '23505') {
            showError("Data sudah terdaftar untuk pendaftaran ini")
          } else if (errorObj?.code === '23502') {
            showError("Data tidak lengkap. Mohon periksa kembali form")
          } else if (errorObj?.code === 'PGRST116' || errorObj?.code === 'PGRST205') {
            showError("Tabel magang belum dibuat. Silakan jalankan SQL setup terlebih dahulu.")
          } else {
            showError("Gagal menyimpan pendaftaran", errorObj?.message || 'Unknown error')
          }
          return
        }
      }
      
      showSuccess(`Pendaftaran berhasil! Menunggu persetujuan guru untuk ${dudi.nama_perusahaan}`)
      
      // Close modal and call success callback
      onOpenChange(false)
      onSuccess?.()
      
    } catch (error) {
      console.error("Registration error:", error)
      showError("Gagal mendaftar magang")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onOpenChange(false)
      }
    }
    if (open) {
      window.addEventListener("keydown", onKeyDown)
      return () => window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onOpenChange])

  if (!dudi) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto mx-auto bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5 text-blue-600" />
            Daftar Magang
          </DialogTitle>
          <DialogDescription>
            Lengkapi form di bawah ini untuk mendaftar magang di {dudi.nama_perusahaan}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconBuilding className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{dudi.nama_perusahaan}</h3>
                <p className="text-sm text-gray-600">{dudi.bidang_usaha}</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>Kuota tersisa: {dudi.kuota_magang - dudi.kuota_terisi} slot</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Informasi Pribadi</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleInputChange("nama", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nis">NIS</Label>
                <Input
                  id="nis"
                  value={formData.nis}
                  onChange={(e) => handleInputChange("nis", e.target.value)}
                  placeholder="NIS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Input
                  id="kelas"
                  value={formData.kelas}
                  onChange={(e) => handleInputChange("kelas", e.target.value)}
                  placeholder="contoh: XII RPL 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurusan">Jurusan</Label>
                <Input
                  id="jurusan"
                  value={formData.jurusan}
                  onChange={(e) => handleInputChange("jurusan", e.target.value)}
                  placeholder="contoh: Rekayasa Perangkat Lunak"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contoh@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telepon">Nomor Telepon *</Label>
                <Input
                  id="telepon"
                  value={formData.telepon}
                  onChange={(e) => handleInputChange("telepon", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
              
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                value={formData.alamat}
                onChange={(e) => handleInputChange("alamat", e.target.value)}
                placeholder="Alamat tempat tinggal"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Informasi Tambahan</h4>
            
            <div className="space-y-2">
              <Label htmlFor="motivasi">Motivasi Magang *</Label>
              <Textarea
                id="motivasi"
                value={formData.motivasi}
                onChange={(e) => handleInputChange("motivasi", e.target.value)}
                placeholder="Jelaskan motivasi Anda untuk magang di perusahaan ini..."
                rows={2}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pengalaman">Pengalaman Terkait</Label>
              <Textarea
                id="pengalaman"
                value={formData.pengalaman}
                onChange={(e) => handleInputChange("pengalaman", e.target.value)}
                placeholder="Ceritakan pengalaman Anda yang relevan dengan bidang magang..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periode_mulai">Periode Mulai</Label>
                <Input
                  id="periode_mulai"
                  type="date"
                  value={formData.periode_mulai}
                  onChange={(e) => handleInputChange("periode_mulai", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periode_selesai">Periode Selesai</Label>
                <Input
                  id="periode_selesai"
                  type="date"
                  value={formData.periode_selesai}
                  onChange={(e) => handleInputChange("periode_selesai", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Mendaftar..." : "Daftar Magang"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
