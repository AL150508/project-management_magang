"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export type LogbookItem = {
  id: string | number
  nama_siswa: string
  tanggal: string
  kegiatan: string
  kendala: string
  status: "Disetujui" | "Ditolak" | "Belum Diverifikasi"
  catatan_guru?: string
  catatan_dudi?: string
  foto?: string
  created_at?: string
  updated_at?: string
}

type LogbookModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  logbook?: LogbookItem | null
  onSuccess: () => void
  mode: "add" | "edit" | "review" // add: tambah baru, edit: edit siswa, review: guru review
  defaultNamaSiswa?: string
}

export function LogbookModal({ open, onOpenChange, logbook, onSuccess, mode, defaultNamaSiswa }: LogbookModalProps) {
  const [formData, setFormData] = React.useState({
    nama_siswa: "",
    tanggal: "",
    kegiatan: "",
    kendala: "",
    status: "Belum Diverifikasi" as "Disetujui" | "Ditolak" | "Belum Diverifikasi",
    catatan_guru: "",
    catatan_dudi: "",
    foto: ""
  })
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)

  React.useEffect(() => {
    if (logbook) {
      setFormData({
        nama_siswa: logbook.nama_siswa || "",
        tanggal: logbook.tanggal || "",
        kegiatan: logbook.kegiatan || "",
        kendala: logbook.kendala || "",
        status: logbook.status || "Belum Diverifikasi",
        catatan_guru: logbook.catatan_guru || "",
        catatan_dudi: logbook.catatan_dudi || "",
        foto: logbook.foto || ""
      })
    } else {
      setFormData({
        nama_siswa: defaultNamaSiswa || "",
        tanggal: "",
        kegiatan: "",
        kendala: "",
        status: "Belum Diverifikasi",
        catatan_guru: "",
        catatan_dudi: "",
        foto: ""
      })
    } 
  }, [logbook, defaultNamaSiswa])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabaseBrowser) {
        toast.error("Database tidak tersedia. Silakan hubungi administrator.")
        return
      }

      const dataToSubmit = {
        nama_siswa: formData.nama_siswa,
        tanggal: formData.tanggal,
        kegiatan: formData.kegiatan,
        kendala: formData.kendala,
        status: formData.status,
        catatan_guru: formData.catatan_guru || null,
        catatan_dudi: formData.catatan_dudi || null,
        foto: formData.foto || null,
      }

      console.log("Submitting logbook payload:", dataToSubmit)

      if (logbook && mode !== "add") {
        // Update existing data
        const { error, status, statusText } = await supabaseBrowser
          .from("logbook")
          .update({
            ...dataToSubmit
          })
          .eq("id", logbook.id)

        if (error || (status && status >= 400)) {
          const composed = error?.message || statusText || "Unknown error"
          const details = [error?.details, error?.hint, error?.code].filter(Boolean).join(" | ")
          throw new Error([composed, details].filter(Boolean).join(" — "))
        }

        toast.success("Data logbook berhasil diperbarui")
      } else {
        // Create new data
        const { error, status, statusText } = await supabaseBrowser
          .from("logbook")
          .insert([{
            ...dataToSubmit
          }])
          .select('*')

        if (error || (status && status >= 400)) {
          const composed = error?.message || statusText || "Unknown error"
          const details = [error?.details, error?.hint, error?.code].filter(Boolean).join(" | ")
          throw new Error([composed, details].filter(Boolean).join(" — "))
        }

        toast.success("Data logbook berhasil ditambahkan")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving logbook data:", error)
      const details = error instanceof Error ? error.message : JSON.stringify(error)
      toast.error(`Gagal menyimpan data logbook (${details})`)
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

  // Upload helper for drag & drop / click select
  const uploadImage = async (file: File) => {
    try {
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB")
        return
      }
      setUploading(true)
      const fileExt = file.name.split(".").pop() || "jpg"
      const filePath = `logbook/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: upErr } = await supabaseBrowser.storage.from("logbook-photos").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      })
      if (upErr) throw upErr
      const { data: pub } = supabaseBrowser.storage.from("logbook-photos").getPublicUrl(filePath)
      if (!pub?.publicUrl) {
        throw new Error("Gagal mendapatkan URL publik")
      }
      handleInputChange("foto", pub.publicUrl)
      toast.success("Foto berhasil diunggah")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast.error(`Gagal unggah foto: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await uploadImage(files[0])
    }
  }

  const onBrowseClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        await uploadImage(input.files[0])
      }
    }
    input.click()
  }

  const getTitle = () => {
    switch (mode) {
      case "add":
        return "Tambah Logbook Baru"
      case "edit":
        return "Edit Logbook"
      case "review":
        return "Review Logbook"
      default:
        return "Logbook"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "add":
        return "Tambahkan logbook kegiatan magang siswa"
      case "edit":
        return "Edit logbook kegiatan magang siswa"
      case "review":
        return "Berikan catatan dan status untuk logbook siswa"
      default:
        return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama_siswa">Nama Siswa *</Label>
              <Input
                id="nama_siswa"
                value={formData.nama_siswa}
                onChange={(e) => handleInputChange("nama_siswa", e.target.value)}
                placeholder="Masukkan nama siswa"
                required
                disabled={mode === "review"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal *</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => handleInputChange("tanggal", e.target.value)}
                required
                disabled={mode === "review"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kegiatan">Kegiatan *</Label>
            <Textarea
              id="kegiatan"
              value={formData.kegiatan}
              onChange={(e) => handleInputChange("kegiatan", e.target.value)}
              placeholder="Deskripsikan kegiatan yang dilakukan..."
              required
              disabled={mode === "review"}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kendala">Kendala</Label>
            <Textarea
              id="kendala"
              value={formData.kendala}
              onChange={(e) => handleInputChange("kendala", e.target.value)}
              placeholder="Deskripsikan kendala yang dihadapi..."
              disabled={mode === "review"}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto">URL Foto (Opsional)</Label>
            <Input
              id="foto"
              value={formData.foto}
              onChange={(e) => handleInputChange("foto", e.target.value)}
              placeholder="https://example.com/foto-kegiatan.jpg — atau seret & lepas foto di bawah"
              disabled={mode === "review"}
            />
            {/* Dropzone */}
            {mode !== "review" && (
              <div
                onDragEnter={(e)=>{e.preventDefault(); setDragActive(true)}}
                onDragOver={(e)=>{e.preventDefault(); setDragActive(true)}}
                onDragLeave={(e)=>{e.preventDefault(); setDragActive(false)}}
                onDrop={onDrop}
                onClick={onBrowseClick}
                className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-sm transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
              >
                <p className="text-gray-600">Seret & lepas foto ke sini, atau klik untuk memilih file</p>
                <p className="text-gray-500 mt-1">Maksimal 5MB, format gambar</p>
                {uploading && <p className="text-blue-600 mt-2">Mengunggah foto...</p>}
              </div>
            )}
          </div>

          {/* Status - hanya untuk review mode atau edit */}
          {(mode === "review" || mode === "edit") && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum Diverifikasi">Belum Diverifikasi</SelectItem>
                  <SelectItem value="Disetujui">Disetujui</SelectItem>
                  <SelectItem value="Ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Catatan Guru - hanya untuk review mode atau edit */}
          {(mode === "review" || mode === "edit") && (
            <div className="space-y-2">
              <Label htmlFor="catatan_guru">Catatan Guru</Label>
              <Textarea
                id="catatan_guru"
                value={formData.catatan_guru}
                onChange={(e) => handleInputChange("catatan_guru", e.target.value)}
                placeholder="Berikan catatan atau feedback untuk siswa..."
                rows={3}
              />
            </div>
          )}

          {/* Catatan DUDI - hanya untuk review mode atau edit */}
          {(mode === "review" || mode === "edit") && (
            <div className="space-y-2">
              <Label htmlFor="catatan_dudi">Catatan DUDI</Label>
              <Textarea
                id="catatan_dudi"
                value={formData.catatan_dudi}
                onChange={(e) => handleInputChange("catatan_dudi", e.target.value)}
                placeholder="Berikan catatan dari pihak DUDI..."
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : 
                mode === "add" ? "Tambah" : 
                mode === "edit" ? "Perbarui" : 
                "Simpan Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
