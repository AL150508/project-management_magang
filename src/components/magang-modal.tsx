"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { useAuth } from "@/context/auth-context"
import { sendPushToRole } from "@/lib & database connection/send-push"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// Type untuk data siswa magang
export type MagangItem = {
  id: string | number // ID unik siswa magang
  nama_siswa: string // Nama lengkap siswa
  nis?: string // Nomor Induk Siswa
  kelas?: string // Kelas siswa (contoh: XII RPL 1)
  jurusan?: string // Jurusan siswa (contoh: Rekayasa Perangkat Lunak)
  nama_dudi?: string // Nama perusahaan tempat magang
  periode_mulai?: string // Tanggal mulai magang
  periode_selesai?: string // Tanggal selesai magang
  status?: "Aktif" | "Selesai" | "Pending" // Status magang
  nilai?: number // Nilai magang (0-100)
  created_at?: string // Tanggal dibuat
  updated_at?: string // Tanggal terakhir diupdate
}

// Props untuk komponen modal magang
type MagangModalProps = {
  open: boolean // Status modal (terbuka/tutup)
  onOpenChange: (open: boolean) => void // Function untuk mengubah status modal
  magang?: MagangItem | null // Data magang yang akan diedit (null untuk tambah baru)
  onSuccess: () => void // Callback setelah berhasil simpan
}

// Komponen modal untuk menambah/edit data siswa magang
export function MagangModal({ open, onOpenChange, magang, onSuccess }: MagangModalProps) {
  // Get user from auth context
  const { user } = useAuth()
  
  // State untuk data form
  const [formData, setFormData] = React.useState({
    nama_siswa: "", // Nama siswa
    nis: "", // Nomor Induk Siswa
    kelas: "", // Kelas siswa
    jurusan: "", // Jurusan siswa
    nama_dudi: "", // Nama perusahaan DUDI
    periode_mulai: "", // Tanggal mulai magang
    periode_selesai: "", // Tanggal selesai magang
    status: "Pending" as "Aktif" | "Selesai" | "Pending", // Status magang
    nilai: "" // Nilai magang
  })
  const [loading, setLoading] = React.useState(false) // Loading state saat submit
  const [dudiOptions, setDudiOptions] = React.useState<string[]>([]) // Daftar nama DUDI untuk select
  const [loadingDudi, setLoadingDudi] = React.useState(false) // Loading state saat load DUDI
  const [siswaOptions, setSiswaOptions] = React.useState<string[]>([]) // Daftar nama siswa untuk select
  const [loadingSiswa, setLoadingSiswa] = React.useState(false) // Loading state saat load siswa
  const [showManualInput, setShowManualInput] = React.useState(false) // Toggle manual input
  const [mounted, setMounted] = React.useState(false) // State untuk mencegah hydration mismatch

  // Effect untuk mengisi form data saat edit atau reset saat tambah baru
  React.useEffect(() => {
    if (magang) {
      // Jika ada data magang, isi form dengan data yang ada (mode edit)
      setFormData({
        nama_siswa: magang.nama_siswa || "",
        nis: magang.nis || "",
        kelas: magang.kelas || "",
        jurusan: magang.jurusan || "",
        nama_dudi: magang.nama_dudi || "",
        periode_mulai: magang.periode_mulai || "",
        periode_selesai: magang.periode_selesai || "",
        status: magang.status || "Pending",
        nilai: magang.nilai?.toString() || ""
      })
    } else {
      // Jika tidak ada data magang, reset form (mode tambah baru)
      setFormData({
        nama_siswa: "",
        nis: "",
        kelas: "",
        jurusan: "",
        nama_dudi: "",
        periode_mulai: "",
        periode_selesai: "",
        status: "Pending",
        nilai: ""
      })
    } 
  }, [magang])

  // Effect untuk memuat daftar DUDI dari database untuk opsi select
  React.useEffect(() => {
    const loadDudi = async () => {
      try {
        if (!supabaseBrowser) return
        setLoadingDudi(true)
        // Ambil nama perusahaan dari tabel dudi
        const { data, error } = await supabaseBrowser
          .from("dudi")
          .select("nama_perusahaan")
          .order("nama_perusahaan", { ascending: true })
        if (error) throw error
        // Filter dan ambil nama perusahaan yang valid
        const names = (data || [])
          .map((row: { nama_perusahaan?: string }) => row.nama_perusahaan)
          .filter((v): v is string => Boolean(v))
        // Hapus duplikasi dan set ke state
        setDudiOptions(Array.from(new Set(names)))
      } catch (err) {
        console.error("Gagal memuat daftar DUDI:", err)
      } finally {
        setLoadingDudi(false)
      }
    }
    loadDudi()
  }, [])

  // Effect untuk memuat daftar siswa dari database untuk opsi select
  React.useEffect(() => {
    const loadSiswa = async () => {
      try {
        if (!supabaseBrowser) return
        setLoadingSiswa(true)
        // Ambil nama siswa dari tabel magang yang sudah ada
        const { data, error } = await supabaseBrowser
          .from("magang")
          .select("nama_siswa")
          .order("nama_siswa", { ascending: true })
        if (error) throw error
        // Filter dan ambil nama siswa yang valid
        const names = (data || [])
          .map((row: { nama_siswa?: string }) => row.nama_siswa)
          .filter((v): v is string => Boolean(v))
        // Hapus duplikasi dan set ke state
        setSiswaOptions(Array.from(new Set(names)))
      } catch (err) {
        console.error("Gagal memuat daftar siswa:", err)
      } finally {
        setLoadingSiswa(false)
      }
    }
    loadSiswa()
  }, [])

  // Effect untuk menandai komponen sudah ter-mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Fungsi untuk handle submit form (tambah/edit data magang)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }

      // Validasi data yang wajib diisi
      const requiredFields = [
        { field: 'nama_dudi', label: 'Nama DUDI' },
        { field: 'periode_mulai', label: 'Periode Mulai' },
        { field: 'periode_selesai', label: 'Periode Selesai' }
      ]

      for (const { field, label } of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`${label} wajib diisi`)
        }
      }

      // Get student name
      let studentName = formData.nama_siswa
      if (!magang && user?.fullName) {
        // For new entries, use user's fullName from auth context
        studentName = user.fullName
      }

      // Format data sesuai struktur database
      const dataToSubmit = {
        Siswa: studentName, // Kolom Siswa diisi dengan nama siswa
        nama_siswa: studentName, // Kolom nama_siswa juga diisi dengan nama siswa
        nis: formData.nis || null, // NIS
        kelas: formData.kelas || null, // Kelas
        jurusan: formData.jurusan || null, // Jurusan
        nama_dudi: formData.nama_dudi || null, // Nama DUDI
        periode_mulai: formData.periode_mulai || null, // Periode mulai
        periode_selesai: formData.periode_selesai || null, // Periode selesai
        status: formData.status, // Status magang
        nilai: formData.nilai ? Number(formData.nilai) : null, // Konversi nilai ke number
      }

      if (magang) {
        // Mode edit: Update data yang sudah ada
        const { error, status, statusText } = await supabaseBrowser
          .from("magang")
          .update({
            ...dataToSubmit
          })
          .eq("Siswa", magang.nama_siswa) // Update berdasarkan nama siswa

        if (error || (status && status >= 400)) {
          const composed = error?.message || statusText || "Unknown error"
          const details = [error?.details, error?.hint, error?.code].filter(Boolean).join(" | ")
          throw new Error([composed, details].filter(Boolean).join(" — "))
        }

        toast.success("Data siswa magang berhasil diperbarui")
        
        // Send push notification if status changed to Aktif (approved)
        if (magang.status === 'Pending' && formData.status === 'Aktif') {
          // Get siswa user_id from users table
          const { data: siswaData } = await supabaseBrowser
            .from('users')
            .select('id')
            .eq('full_name', formData.nama_siswa)
            .single()
          
          if (siswaData?.id) {
            const { sendPushToUser } = await import('@/lib & database connection/send-push')
            sendPushToUser(siswaData.id, {
              title: '✅ Magang Disetujui',
              body: `Magang Anda di ${formData.nama_dudi} telah disetujui!`,
              url: '/magang'
            }).catch(err => console.error('Push notification error:', err))
          }
        }
      } else {
        // Mode tambah: Insert data baru
        const { error, status, statusText } = await supabaseBrowser
          .from("magang")
          .insert([{
            ...dataToSubmit
          }])
          .select('Siswa,nama_siswa,nis,kelas,jurusan,nama_dudi,periode_mulai,periode_selesai,status,nilai')

        if (error || (status && status >= 400)) {
          const composed = error?.message || statusText || "Unknown error"
          const details = [error?.details, error?.hint, error?.code].filter(Boolean).join(" | ")
          throw new Error([composed, details].filter(Boolean).join(" — "))
        }

        toast.success("Data siswa magang berhasil ditambahkan")
        
        // Send push notification to all guru/admin
        sendPushToRole('guru', {
          title: '📝 Pendaftaran Magang Baru',
          body: `${formData.nama_siswa} telah mendaftar magang di ${formData.nama_dudi}`,
          url: '/magang'
        }).catch(err => console.error('Push notification error:', err))
      }

      // Callback sukses dan tutup modal
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving magang data:", error)
      let errorMessage = "Gagal menyimpan data siswa magang"
      
      // Handle berbagai jenis error database
      if (error instanceof Error) {
        if (error.message.includes("duplicate key value violates unique constraint")) {
          errorMessage = "Data siswa magang sudah ada. Silakan gunakan data yang berbeda atau edit data yang sudah ada."
        } else if (error.message.includes("23505")) {
          errorMessage = "Data dengan informasi yang sama sudah tersedia. Silakan periksa kembali data yang dimasukkan."
        } else if (error.message.includes("23502")) {
          errorMessage = "Data tidak lengkap. Silakan isi semua field yang wajib diisi."
        } else if (error.message.includes("23503")) {
          errorMessage = "Data yang dipilih tidak valid. Silakan pilih data yang tersedia."
        } else {
          errorMessage = `Gagal menyimpan data: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk mengubah nilai form field
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value // Update field yang dipilih dengan nilai baru
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle>
            {magang ? "Edit Data Siswa Magang" : "Tambah Data Siswa Magang"}
          </DialogTitle>
          <DialogDescription>
            {magang 
              ? "Perbarui informasi siswa magang yang sudah ada" 
              : "Tambahkan data siswa magang baru ke dalam sistem"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nama_siswa">Nama Siswa *</Label>
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {showManualInput ? "Pilih dari daftar" : "Input manual"}
                </button>
              </div>
              {showManualInput ? (
                <Input
                  id="nama_siswa"
                  value={formData.nama_siswa}
                  onChange={(e) => handleInputChange("nama_siswa", e.target.value)}
                  placeholder="Ketik nama siswa baru"
                  required
                />
              ) : (
                mounted ? (
                  <Select
                    value={formData.nama_siswa}
                    onValueChange={(value) => {
                      if (value === "__manual__") {
                        setShowManualInput(true)
                        handleInputChange("nama_siswa", "")
                      } else {
                        handleInputChange("nama_siswa", value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSiswa ? "Memuat..." : "Pilih atau ketik nama siswa"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__manual__">
                        <span className="text-blue-600 font-medium">+ Ketik nama baru</span>
                      </SelectItem>
                      {siswaOptions.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input disabled placeholder="Memuat..." />
                )
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nis">NIS</Label>
              <Input
                id="nis"
                value={formData.nis}
                onChange={(e) => handleInputChange("nis", e.target.value)}
                placeholder="Nomor Induk Siswa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas</Label>
              <Input
                id="kelas"
                value={formData.kelas}
                onChange={(e) => handleInputChange("kelas", e.target.value)}
                placeholder="Contoh: XII RPL 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jurusan">Jurusan</Label>
              <Input
                id="jurusan"
                value={formData.jurusan}
                onChange={(e) => handleInputChange("jurusan", e.target.value)}
                placeholder="Contoh: Rekayasa Perangkat Lunak"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_dudi">Nama DUDI</Label>
            {mounted ? (
              <Select
                value={formData.nama_dudi}
                onValueChange={(value) => handleInputChange("nama_dudi", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingDudi ? "Memuat..." : "Pilih perusahaan"} />
                </SelectTrigger>
                <SelectContent>
                  {dudiOptions.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input disabled placeholder="Memuat..." />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nilai">Nilai</Label>
              <Input
                id="nilai"
                type="number"
                min="0"
                max="100"
                value={formData.nilai}
                onChange={(e) => handleInputChange("nilai", e.target.value)}
                placeholder="0-100"
              />
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
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Menyimpan..." : magang ? "Perbarui" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
