"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconBuilding } from "@tabler/icons-react"
import { toast } from "sonner"
import type { DudiItem } from "./dudi-table"

// Props untuk komponen modal DUDI
type DudiModalProps = {
  open: boolean // Status modal (terbuka/tutup)
  onOpenChange: (open: boolean) => void // Function untuk mengubah status modal
  dudi?: DudiItem | null // Data DUDI yang akan diedit (null untuk tambah baru)
  onSuccess: () => void // Callback setelah berhasil simpan
}

// Komponen modal untuk menambah/edit data DUDI (Dunia Usaha dan Industri)
export function DudiModal({ open, onOpenChange, dudi, onSuccess }: DudiModalProps) {
  const [loading, setLoading] = React.useState(false) // Loading state saat submit
  const [formData, setFormData] = React.useState({
    nama_perusahaan: "", // Nama perusahaan
    alamat: "", // Alamat lengkap perusahaan
    telepon: "", // Nomor telepon perusahaan
    email: "", // Email perusahaan
    penanggung_jawab: "", // Nama penanggung jawab
    jumlah_siswa: 0, // Jumlah siswa yang sedang magang
  })

  // Effect untuk mengisi form data saat edit atau reset saat tambah baru
  React.useEffect(() => {
    if (dudi) {
      // Jika ada data DUDI, isi form dengan data yang ada (mode edit)
      setFormData({
        nama_perusahaan: dudi.nama_perusahaan || "",
        alamat: dudi.alamat || "",
        telepon: dudi.telepon || "",
        email: dudi.email || "",
        penanggung_jawab: dudi.penanggung_jawab || "",
        jumlah_siswa: dudi.jumlah_siswa || 0,
      })
    } else {
      // Jika tidak ada data DUDI, reset form (mode tambah baru)
      setFormData({
        nama_perusahaan: "",
        alamat: "",
        telepon: "",
        email: "",
        penanggung_jawab: "",
        jumlah_siswa: 0,
      })
    }
  }, [dudi])

  // Fungsi untuk handle submit form (tambah/edit data DUDI)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabaseBrowser) {
        toast.error("Supabase client not initialized")
        return
      }

      if (dudi) {
        // Mode edit: Update data DUDI yang sudah ada
        const { data, error } = await supabaseBrowser
          .from("dudi")
          .update({
            nama_perusahaan: formData.nama_perusahaan,
            alamat: formData.alamat,
            telepon: formData.telepon,
            email: formData.email,
            penanggung_jawab: formData.penanggung_jawab,
            jumlah_siswa: formData.jumlah_siswa,
            updated_at: new Date().toISOString(), // Timestamp update
          })
          .eq("id", dudi.id) // Update berdasarkan ID
          .select()

        if (error) {
          console.error("Supabase update error:", error)
          throw new Error(`Gagal memperbarui data: ${error.message}`)
        }
        
        console.log("DUDI updated successfully:", data)
        toast.success("Data DUDI berhasil diperbarui")
      } else {
        // Mode tambah: Insert data DUDI baru
        const { data, error } = await supabaseBrowser
          .from("dudi")
          .insert({
            nama_perusahaan: formData.nama_perusahaan,
            alamat: formData.alamat,
            telepon: formData.telepon,
            email: formData.email,
            penanggung_jawab: formData.penanggung_jawab,
            jumlah_siswa: formData.jumlah_siswa,
          })
          .select()

        if (error) {
          console.error("Supabase insert error:", error)
          throw new Error(`Gagal menambahkan data: ${error.message}`)
        }
        
        console.log("DUDI created successfully:", data)
        toast.success("Data DUDI berhasil ditambahkan")
      }

      // Callback sukses dan tutup modal
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving DUDI:", error)
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk mengubah nilai form field
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value, // Update field yang dipilih dengan nilai baru
    }))
  }

  // Jika modal tidak terbuka, tidak render apa-apa
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay untuk menutup modal saat klik di luar */}
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        {/* Header modal dengan icon dan judul */}
        <div className="flex items-center gap-2 mb-4">
          <IconBuilding className="size-5 text-blue-600" />
          <h2 className="text-lg font-semibold">
            {dudi ? "Edit DUDI" : "Tambah DUDI Baru"}
          </h2>
        </div>
        
        {/* Deskripsi modal */}
        <p className="text-sm text-gray-600 mb-6">
          {dudi ? "Perbarui informasi perusahaan mitra" : "Tambahkan perusahaan mitra baru"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama_perusahaan">Nama Perusahaan</Label>
            <Input
              id="nama_perusahaan"
              placeholder="Masukkan nama perusahaan"
              value={formData.nama_perusahaan}
              onChange={(e) => handleInputChange("nama_perusahaan", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              placeholder="Masukkan alamat lengkap"
              value={formData.alamat}
              onChange={(e) => handleInputChange("alamat", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telepon">Telepon</Label>
            <Input
              id="telepon"
              placeholder="Contoh: 021-12345678"
              value={formData.telepon}
              onChange={(e) => handleInputChange("telepon", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Contoh: info@perusahaan.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="penanggung_jawab">Penanggung Jawab</Label>
            <Input
              id="penanggung_jawab"
              placeholder="Nama penanggung jawab"
              value={formData.penanggung_jawab}
              onChange={(e) => handleInputChange("penanggung_jawab", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah_siswa">Jumlah Siswa Magang</Label>
            <Input
              id="jumlah_siswa"
              type="number"
              min="0"
              placeholder="0"
              value={formData.jumlah_siswa}
              onChange={(e) => handleInputChange("jumlah_siswa", parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
