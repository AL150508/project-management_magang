"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { Camera } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { AvatarCropModal } from "./avatar-crop-modal"
import { uploadAvatar, updateUserAvatar } from "@/lib & database connection/avatar-upload-helper"

interface ProfileEditProps {
  onCancel: () => void
  onSave: () => void
}

export function ProfileEdit({ onCancel, onSave }: ProfileEditProps) {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    displayName: user?.username || "",
    username: user?.username || "",
    gender: "",
    birthDate: "",
    phone: "",
    province: "",
    city: "",
    occupation: "",
    bio: ""
  })
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user?.avatar || null)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [cropModalOpen, setCropModalOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  const initials = (user?.fullName || user?.username || "U")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle avatar file selection
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File tidak valid. Pilih file gambar (JPG, PNG, WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File terlalu besar. Maksimal ukuran file 5MB')
      return
    }

    // Read file and open crop modal
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setCropModalOpen(true)
    }
    reader.readAsDataURL(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle crop complete
  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setIsUploading(true)

      if (!user) return

      // Upload to Supabase Storage
      const { url } = await uploadAvatar(croppedBlob, user.id)

      // Update database
      await updateUserAvatar(user.id, url)

      // Update AuthContext to refresh avatar everywhere
      setUser({ ...user, avatar: url })

      // Update local preview
      setAvatarPreview(url)

      toast.success('Foto profil berhasil diperbarui!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Gagal upload foto. Terjadi kesalahan saat mengupload foto profil')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = () => {
    toast.success("Profil berhasil diperbarui")
    onSave()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Profil</h1>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        {/* Avatar Upload */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={avatarPreview || user?.avatar} alt={user?.fullName || user?.username} />
              <AvatarFallback className="bg-blue-600 text-white text-3xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button 
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload foto profil (Max 5MB)"
            >
              {isUploading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2 absolute bottom-0">
            Klik icon kamera untuk upload<br />
            Max 5MB
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Nama Panjang */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Panjang</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Masukkan nama lengkap..."
            />
          </div>

          {/* Nama Panggilan */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Nama Panggilan</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              placeholder="Masukkan nama panggilan..."
            />
          </div>

          {/* Nama Pengguna */}
          <div className="space-y-2">
            <Label htmlFor="username">Nama Pengguna</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="@username"
            />
          </div>

          {/* Jenis Kelamin */}
          <div className="space-y-2">
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kelamin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tanggal Lahir */}
          <div className="space-y-2">
            <Label htmlFor="birthDate">Tanggal Lahir</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
          </div>

          {/* Pekerjaan */}
          <div className="space-y-2">
            <Label htmlFor="occupation">Pekerjaan</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
              placeholder="Masukkan Pekerjaan..."
            />
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+62 345 6789 1234"
            />
          </div>

          {/* Provinsi */}
          <div className="space-y-2">
            <Label htmlFor="province">Provinsi</Label>
            <Input
              id="province"
              value={formData.province}
              onChange={(e) => handleChange("province", e.target.value)}
              placeholder="Provinsi"
              disabled
            />
          </div>

          {/* Kota */}
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Kabupaten/Kota"
            />
          </div>
        </div>

        {/* Tentang Saya */}
        <div className="mt-6 space-y-2">
          <Label htmlFor="bio">Tentang Saya</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 text-right">
            {formData.bio.length}/400 karakter
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            Simpan
          </Button>
        </div>
      </div>

      {/* Avatar Crop Modal */}
      {selectedImage && (
        <AvatarCropModal
          open={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false)
            setSelectedImage(null)
          }}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}