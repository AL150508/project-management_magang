"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { useAuth } from "@/context/auth-context"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { showSuccess, showError, showInfo } from "@/lib & database connection/utils"
import { createNotificationForAll } from "@/lib & database connection/create-notification"

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
  const { user } = useAuth()
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
  const [compressImage, setCompressImage] = React.useState(true)

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
       showError("Database tidak tersedia. Silakan hubungi administrator.")
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

       showSuccess("Data logbook berhasil diperbarui")
      } else {
        // Create new data with user_id
        const { error, status, statusText } = await supabaseBrowser
          .from("logbook")
          .insert([{
            ...dataToSubmit,
            user_id: user?.id || null // Add user_id for filtering
          }])
          .select('*')

        if (error || (status && status >= 400)) {
          const composed = error?.message || statusText || "Unknown error"
          const details = [error?.details, error?.hint, error?.code].filter(Boolean).join(" | ")
          throw new Error([composed, details].filter(Boolean).join(" — "))
        }

        showSuccess("Data logbook berhasil ditambahkan")
        
        // Send push notification to ALL subscribed devices (Windows notification)
        fetch('/api/test-push-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '📖 Logbook Baru',
            body: `${formData.nama_siswa} mengirim logbook: ${formData.kegiatan.substring(0, 50)}...`,
            icon: '/icons/icon-192x192.png',
            url: '/logbook'
          })
        })
        .then(res => res.json())
        .then(data => console.log('✅ Push notification sent to', data.sent, 'device(s)'))
        .catch(err => console.error('❌ Push notification error:', err))
        
        // Create in-app notification for ALL users (bell icon notification)
        createNotificationForAll({
          title: "Logbook Baru",
          message: `${formData.nama_siswa} mengirim logbook: ${formData.kegiatan.substring(0, 50)}...`,
          type: "logbook",
          senderName: formData.nama_siswa,
          senderId: user?.id,
          actionUrl: "/logbook"
        })
        .then(result => {
          if (result.success) {
            console.log(`✅ In-app notification created for ${result.count} user(s) (all roles) `)
          }
        })
        .catch(err => console.error('❌ In-app notification error:', err))
      }

      // Trigger data refresh first
      onSuccess()
      
      // Small delay to allow Realtime to sync before closing modal
      await new Promise(resolve => setTimeout(resolve, 300))
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving logbook data:", error)
      const details = error instanceof Error ? error.message : JSON.stringify(error)
      showError("Gagal menyimpan data logbook", details)
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

  // Helper function to convert image to WebP
  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Set canvas size (compress if too large)
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and convert to WebP
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) {
            const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
              type: 'image/webp'
            })
            resolve(webpFile)
          } else {
            reject(new Error('Failed to convert to WebP'))
          }
        }, 'image/webp', 0.8) // 80% quality
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Helper function to create compressed thumbnail
  const createThumbnail = (file: File, maxSize: number = 300): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate thumbnail size maintaining aspect ratio
        let { width, height } = img
        const ratio = Math.min(maxSize / width, maxSize / height)
        width *= ratio
        height *= ratio
        
        canvas.width = width
        canvas.height = height
        
        // Draw thumbnail
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with compression
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(new Error('Failed to create thumbnail'))
            reader.readAsDataURL(blob)
          } else {
            reject(new Error('Failed to create thumbnail blob'))
          }
        }, 'image/webp', 0.7) // 70% quality for thumbnail
      }
      
      img.onerror = () => reject(new Error('Failed to load image for thumbnail'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Upload helper for drag & drop / click select (supports images and videos)
  const uploadMedia = async (file: File) => {
    try {
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }
      
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      
      if (!isImage && !isVideo) {
        showError("File harus berupa gambar atau video")
        return
      }
      
      // Size limits: 5MB for images, 50MB for videos
      const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024
      if (file.size > maxSize) {
        showError(`Ukuran file maksimal ${isImage ? '5MB' : '50MB'}`)
        return
      }
      
      setUploading(true)
      
      let fileToUpload = file
      
      // Try to use bucket directly without listing (more reliable)
      const bucketNames = ["Logbook-media", "logbook-media", "logbook-photos"]
      let bucketName = ""
      let bucketError = null
      
      // Test each bucket by trying to access it directly
      for (const name of bucketNames) {
        try {
          console.log(`🔍 Testing bucket: "${name}"...`)
          
          // Try to access the bucket by attempting to list files (this will fail gracefully if bucket doesn't exist)
          const testResult = await supabaseBrowser.storage.from(name).list('', { limit: 1 })
          
          if (!testResult.error) {
            bucketName = name
            console.log("✅ Successfully connected to bucket:", bucketName)
            break
          } else {
            console.log(`❌ Bucket "${name}" error:`, testResult.error?.message)
            bucketError = testResult.error as any
          }
        } catch (error: any) {
          console.log(`❌ Bucket "${name}" failed:`, error)
          bucketError = error
          continue
        }
      }
      
      // If no bucket found, try to use the first one anyway (sometimes listBuckets fails but direct access works)
      if (!bucketName) {
        console.warn("⚠️ No bucket accessible, trying Logbook-media anyway...")
        bucketName = "Logbook-media"
        showInfo("Attempting upload to Logbook-media bucket...")
      }
      
      // Convert images to WebP (optional via checkbox)
      if (isImage && compressImage) {
        try {
          fileToUpload = await convertToWebP(file)
          showInfo("Mengkonversi gambar ke format WebP...")
        } catch (convertError) {
          console.warn("WebP conversion failed, using original:", convertError)
          // Fallback to original file if conversion fails
        }
      }
      
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).slice(2)
      const fileExt = fileToUpload.name.split(".").pop() || (isImage ? "webp" : "mp4")
      const filePath = `logbook/${timestamp}-${randomId}.${fileExt}`
      
      console.log("📤 Uploading to bucket:", bucketName, "path:", filePath)
      console.log("📎 File details:", {
        name: fileToUpload.name,
        size: fileToUpload.size,
        type: fileToUpload.type
      })
      
      const { error: upErr, data: uploadData } = await supabaseBrowser.storage.from(bucketName).upload(filePath, fileToUpload, {
        cacheControl: "3600",
        upsert: true,
        contentType: fileToUpload.type,
      })
      
      if (upErr) {
        console.error("❌ Upload error details:", {
          message: upErr.message,
          error: upErr
        })
        
        // Provide more specific error messages
        if (upErr.message?.includes('Bucket not found')) {
          throw new Error(`Storage bucket '${bucketName}' not found. Please create the bucket in Supabase Dashboard.`)
        } else if (upErr.message?.includes('not allowed')) {
          throw new Error(`Upload not allowed. Please check storage policies for bucket '${bucketName}'.`)
        } else {
          throw new Error(`Upload failed: ${upErr.message}`)
        }
      }
      
      console.log("✅ Upload successful:", uploadData)
      
      const { data: pub } = supabaseBrowser.storage.from(bucketName).getPublicUrl(filePath)
      if (!pub?.publicUrl) {
        throw new Error("Gagal mendapatkan URL publik")
      }
      
      // Store media info with type
      const mediaInfo = {
        url: pub.publicUrl,
        type: isImage ? 'image' : 'video',
        filename: fileToUpload.name
      }
      
      handleInputChange("foto", JSON.stringify(mediaInfo))
      showSuccess(`${isImage ? 'Foto' : 'Video'} berhasil diunggah`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      showError("Gagal unggah media", msg)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await uploadMedia(files[0])
    }
  }

  const onBrowseClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*,video/*"
    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        await uploadMedia(input.files[0])
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border border-slate-200 shadow-xl">
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
            <Label htmlFor="foto">Media Dokumentasi (Opsional)</Label>
            
            {/* Media Preview */}
            {formData.foto && (() => {
              try {
                const mediaInfo = JSON.parse(formData.foto)
                return (
                  <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="relative group flex-shrink-0">
                        {mediaInfo.type === 'image' ? (
                          <div className="relative">
                            <img 
                              src={mediaInfo.url} 
                              alt="Media Preview" 
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                              loading="lazy"
                              onClick={() => window.open(mediaInfo.url, '_blank')}
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-xs text-white">📷</span>
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">🔍 View</span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <video 
                              src={mediaInfo.url} 
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                              muted
                              preload="metadata"
                              onClick={() => window.open(mediaInfo.url, '_blank')}
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-xs text-white">🎥</span>
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-xl transition-all duration-200 flex items-center justify-center">
                              <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-sm">▶️</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                              {mediaInfo.filename || 'Media File'}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                mediaInfo.type === 'image' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {mediaInfo.type === 'image' ? '📷 Foto' : '🎥 Video'}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                WebP Format
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Klik untuk melihat ukuran penuh
                            </p>
                          </div>
                          
                          {mode !== "review" && (
                            <button
                              type="button"
                              onClick={() => handleInputChange("foto", "")}
                              className="ml-3 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              } catch {
                // Fallback for old format (plain URL)
                return (
                  <div className="mt-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="relative group flex-shrink-0">
                        <img 
                          src={formData.foto} 
                          alt="Media Preview" 
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                          loading="lazy"
                          onClick={() => window.open(formData.foto, '_blank')}
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-xs text-white">📷</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">Media Lama</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              📷 Foto Legacy
                            </span>
                            <p className="text-xs text-gray-600 mt-2">
                              Klik untuk melihat ukuran penuh
                            </p>
                          </div>
                          
                          {mode !== "review" && (
                            <button
                              type="button"
                              onClick={() => handleInputChange("foto", "")}
                              className="ml-3 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
                            >
                              ✕ Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}
            
            <Input
              id="foto"
              value={(() => {
                try {
                  const mediaInfo = JSON.parse(formData.foto)
                  return mediaInfo.url
                } catch {
                  return formData.foto
                }
              })()}
              onChange={(e) => handleInputChange("foto", e.target.value)}
              placeholder="https://example.com/media-kegiatan.webp — atau seret & lepas media di bawah"
              disabled={mode === "review"}
            />
            
            {/* Dropzone */}
            {mode !== "review" && (
              <>
                <div
                  onDragEnter={(e)=>{e.preventDefault(); setDragActive(true)}}
                  onDragOver={(e)=>{e.preventDefault(); setDragActive(true)}}
                  onDragLeave={(e)=>{e.preventDefault(); setDragActive(false)}}
                  onDrop={onDrop}
                  onClick={onBrowseClick}
                  className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-sm transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
                >
                  <p className="text-gray-600">📷 Seret & lepas foto/video ke sini, atau klik untuk memilih file</p>
                  <p className="text-gray-500 mt-1">Foto: Maksimal 5MB • Video: Maksimal 50MB</p>
                  {uploading && <p className="text-blue-600 mt-2">Mengunggah media...</p>}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <Checkbox
                    id="compress-image"
                    checked={compressImage}
                    onCheckedChange={(v) => setCompressImage(!!v)}
                  />
                  <label htmlFor="compress-image" className="cursor-pointer select-none">
                    Kompresi foto ke format WebP sebelum upload (disarankan)
                  </label>
                </div>
              </>
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
