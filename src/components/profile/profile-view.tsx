"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Mail, MapPin, Camera
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { AvatarCropModal } from "./avatar-crop-modal"
import { uploadAvatar, updateUserAvatar } from "@/lib & database connection/avatar-upload-helper"

interface ProfileViewProps {
  onEditClick: () => void
}

export function ProfileView({ onEditClick }: ProfileViewProps) {
  const { user, setUser } = useAuth()
  const [cropModalOpen, setCropModalOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  if (!user) return null

  const initials = (user.fullName || user.username || "U")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("File tidak valid. Pilih file gambar (JPG, PNG, WebP)")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File terlalu besar. Maksimal ukuran file 5MB")
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

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setIsUploading(true)

      if (!user) return

      // Upload to Supabase
      const { url } = await uploadAvatar(croppedBlob, user.id)

      // Update database
      await updateUserAvatar(user.id, url)

      // Update AuthContext to refresh avatar everywhere
      setUser({ ...user, avatar: url })

      alert("Foto profil berhasil diperbarui!")
    } catch (error) {
      console.error("Upload error:", error)
      alert("Gagal upload foto. Terjadi kesalahan saat mengupload foto profil")
    } finally {
      setIsUploading(false)
      setCropModalOpen(false)
      setSelectedImage(null)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 space-y-4 sm:space-y-5">
      {/* Profile Card */}
      <Card className="w-full overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar with Camera Button */}
            <div className="flex-shrink-0 relative">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 ring-4 ring-blue-100">
                <AvatarImage src={user.avatar} alt={user.fullName || user.username} />
                <AvatarFallback className="bg-blue-600 text-white text-3xl sm:text-4xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 sm:p-2.5 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ubah foto profil"
              >
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            {/* User Info */}
            <div className="flex-1 w-full min-w-0 text-center sm:text-left">
              {/* Edit Button - Desktop */}
              <div className="hidden sm:flex items-center justify-end mb-3">
                <Button
                  onClick={onEditClick}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6"
                >
                  Edit Profil
                </Button>
              </div>
              
              {/* Name & Username */}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words mb-1">
                {user.fullName || user.username}
              </h2>
              <p className="text-lg sm:text-xl text-blue-600 font-semibold mb-4 break-all">
                @{user.username}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-center sm:justify-start gap-3 text-sm sm:text-base text-gray-700">
                  <Mail className="h-5 w-5 flex-shrink-0 text-gray-500" />
                  <span className="truncate">{user.email || "Email belum diatur"}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-sm sm:text-base text-gray-700">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
                  <span className="truncate">Lokasi belum diatur</span>
                </div>
              </div>
              
              {/* Edit Button - Mobile */}
              <div className="sm:hidden flex justify-center mt-4">
                <Button
                  onClick={onEditClick}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-xs"
                >
                  Edit Profil
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
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