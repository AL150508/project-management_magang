"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { showSuccess, showError, showWarning } from "@/lib & database connection/utils"
import Image from "next/image"
import { RecaptchaWrapper, RecaptchaRef } from "@/components/recaptcha/recaptcha-wrapper"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register, loginWithGoogle, isLoading } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null)
  const recaptchaRef = React.useRef<RecaptchaRef>(null)
  const [formData, setFormData] = React.useState({
    email: "",
    fullName: "",
    username: "",
    password: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // reCAPTCHA wajib untuk keamanan
    if (!recaptchaToken) {
      showError("Silakan verifikasi reCAPTCHA terlebih dahulu.")
      return
    }
    
    try {
      await register({ ...formData, recaptchaToken: recaptchaToken || undefined })
      showSuccess("Registrasi berhasil! Selamat datang!")
      onClose()
    } catch (error) {
      showError("Registrasi gagal. Silakan coba lagi.")
      console.error("Register error:", error)
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    }
  }

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle()
      showSuccess("Registrasi dengan Google berhasil!")
      onClose()
    } catch (error) {
      showError("Registrasi dengan Google gagal.")
      console.error("Google register error:", error)
    }
  }

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null)
    showWarning("reCAPTCHA expired. Silakan verifikasi ulang.")
  }

  const handleRecaptchaError = () => {
    setRecaptchaToken(null)
    showError("reCAPTCHA error. Silakan coba lagi.")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Branding outside modal */}
      {isOpen && (
        <div className="fixed top-8 right-8 z-[60] text-blue-600 font-semibold text-lg uppercase tracking-wide">
          MAGANG PORTAL
        </div>
      )}
      
      <DialogContent className="modal-stable-center bg-white modal-shadow border-0 rounded-2xl overflow-hidden">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Buat akun Anda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {/* OAuth Buttons */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleRegister}
            >
              <Image
                src="/google logo.png"
                alt="Google"
                width={18}
                height={18}
                className="mr-2"
              />
              Daftar dengan Google
            </Button>

          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Atau</span>
            </div>
          </div>

          {/* Register Form - Compact Layout */}
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="h-10"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="john_doe"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="h-10"
                  required
                />
              </div>
            </div>


            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* reCAPTCHA */}
            <RecaptchaWrapper
              ref={recaptchaRef}
              onVerify={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              onError={handleRecaptchaError}
              size="normal"
            />

            <Button
              type="submit"
              disabled={isLoading || !recaptchaToken}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Membuat akun...
                </>
              ) : (
                "👤 Buat Akun"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500 font-medium"
              onClick={onSwitchToLogin}
            >
              Masuk
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
