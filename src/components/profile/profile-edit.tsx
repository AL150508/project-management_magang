"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { AvatarCropModal } from "./avatar-crop-modal"
import { uploadAvatar, updateUserAvatar } from "@/lib & database connection/avatar-upload-helper"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"

interface ProfileEditProps {
  onSave: () => void
}

export function ProfileEdit({ onSave }: ProfileEditProps) {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    email: user?.email || ""
  })
  
  const [passwordData, setPasswordData] = React.useState({
    newPassword: "",
    confirmPassword: ""
  })
  
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user?.avatar || null)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [cropModalOpen, setCropModalOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  
  // State untuk show/hide password
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const initials = (user?.fullName || user?.username || "U")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleChangePassword = async () => {
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    
    if (!user?.email) {
      toast.error('Email tidak ditemukan. Silakan login kembali.')
      return
    }
    
    try {
      setIsChangingPassword(true)
      
      if (!supabaseBrowser) {
        throw new Error('Supabase client not initialized')
      }
      
      // Update password directly (user is already authenticated)
      console.log('🔐 Updating password...')
      
      const { error: updateError } = await supabaseBrowser.auth.updateUser({
        password: passwordData.newPassword
      })
      
      if (updateError) {
        console.error('❌ Update error:', updateError)
        throw updateError
      }
      
      console.log('✅ Password updated successfully in Supabase Auth')
      toast.success('Password berhasil diubah! Gunakan password baru ini untuk login berikutnya.')
      
      // Reset password fields
      setPasswordData({
        newPassword: "",
        confirmPassword: ""
      })
    } catch (error) {
      console.error('❌ Password change error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengubah password'
      toast.error(errorMessage)
    } finally {
      setIsChangingPassword(false)
    }
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

      if (!user) {
        toast.error('Session expired. Silakan login kembali.')
        return
      }

      console.log('🖼️ Starting avatar upload for user:', user.id)

      // Upload to Supabase Storage
      const { url } = await uploadAvatar(croppedBlob, user.id)

      console.log('✅ Upload successful, updating database...')

      // Update database
      await updateUserAvatar(user.id, url)

      // Update AuthContext to refresh avatar everywhere
      setUser({ ...user, avatar: url })

      // Update local preview
      setAvatarPreview(url)

      toast.success('Foto profil berhasil diperbarui!')
      
      // Close crop modal
      setSelectedImage(null)
    } catch (error) {
      console.error('❌ Upload error:', error)
      
      // Show specific error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Terjadi kesalahan tidak terduga'
      
      toast.error(`Gagal upload foto: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Session expired. Silakan login kembali.')
      return
    }

    try {
      if (!supabaseBrowser) {
        throw new Error('Supabase client not initialized')
      }

      // Update user data in database
      const { error: updateError } = await supabaseBrowser
        .from('users')
        .update({
          full_name: formData.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      // Update auth context to refresh everywhere
      setUser({
        ...user,
        fullName: formData.fullName
      })

      toast.success("Profil berhasil diperbarui")
      onSave()
    } catch (error) {
      console.error('Save error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan profil'
      toast.error(`Gagal menyimpan: ${errorMessage}`)
    }
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
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-5.293A1 1 0 0015 4.707V4a1 1 0 00-1-1H9a1 1 0 00-1 1v2a2 2 0 01-2 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h8a2 2 0 012 2v2" clipRule="evenodd" />
                </svg>
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

        {/* Informasi Akun Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Informasi Akun</h2>
          </div>
          <p className="text-sm text-gray-600">Perbarui informasi akun Anda</p>
          
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Masukkan nama lengkap..."
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Simpan Informasi Akun Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Ubah Password Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Ubah Password</h2>
        </div>
        
        {/* Info: No verification needed */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Info:</strong> Karena Anda sudah login, langsung masukkan password baru yang diinginkan. Password lama akan otomatis terganti.
          </p>
        </div>

        {/* Password Baru */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Password Baru</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
              placeholder="Masukkan password baru (min. 6 karakter)"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Konfirmasi Password Baru */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
              placeholder="Ulangi password baru"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Ubah Password Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="bg-gray-600 hover:bg-gray-700 text-white w-full sm:w-auto disabled:opacity-50"
          >
            {isChangingPassword ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Mengubah...
              </>
            
            ) : (
              'Ubah Password'
            )}
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
