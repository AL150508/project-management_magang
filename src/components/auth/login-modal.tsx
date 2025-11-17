"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { showSuccess, showError, showWarning } from "@/lib & database connection/utils"
import Image from "next/image"
import { RecaptchaWrapper, RecaptchaRef } from "@/components/recaptcha/recaptcha-wrapper"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onSwitchToForgotPassword: () => void
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, onSwitchToForgotPassword }: LoginModalProps) {
  const { login, loginWithGoogle, isLoading } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null)
  const recaptchaRef = React.useRef<RecaptchaRef>(null)
  const [formData, setFormData] = React.useState({
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // reCAPTCHA wajib untuk keamanan
    if (!recaptchaToken) {
      showError("Silakan verifikasi reCAPTCHA terlebih dahulu.")
      return
    }
    
    try {
      // Untuk demo, gunakan username sebagai email
      const email = formData.username.includes("@") ? formData.username : `${formData.username}@example.com`
      await login(email, formData.password, recaptchaToken || undefined)
      showSuccess("Login berhasil!")
      onClose()
    } catch (error) {
      showError("Login gagal. Periksa kembali username dan password Anda.")
      console.error("Login error:", error)
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      showSuccess("Login dengan Google berhasil!")
      onClose()
    } catch (error) {
      showError("Login dengan Google gagal.")
      console.error("Google login error:", error)
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
            Masuk ke akun Anda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleLogin}
            >
              <Image
                src="/google logo.png"
                alt="Google"
                width={20}
                height={20}
                className="mr-3"
              />
              Masuk dengan Google
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

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={handleInputChange}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500"
                  onClick={onSwitchToForgotPassword}
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 pr-10"
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
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Masuk...
                </>
              ) : (
                "→ Masuk"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center text-sm text-gray-600">
            Tidak punya akun?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500 font-medium"
              onClick={onSwitchToRegister}
            >
              Daftar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
