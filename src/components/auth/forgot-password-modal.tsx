"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import { showSuccess, showError, showWarning } from "@/lib & database connection/utils"
import { RecaptchaWrapper, RecaptchaRef } from "@/components/recaptcha/recaptcha-wrapper"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null)
  const recaptchaRef = React.useRef<RecaptchaRef>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recaptchaToken) {
      showError("Silakan verifikasi reCAPTCHA terlebih dahulu.")
      return
    }
    
    setIsLoading(true)
    try {
      // TODO: Implementasi actual forgot password dengan Supabase
      // Untuk sekarang, simulasi
      console.log("Reset password for:", email, "reCAPTCHA:", recaptchaToken)
      
      // Simulasi delay API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      showSuccess("Link reset password telah dikirim ke email Anda!")
      onClose()
    } catch (error) {
      showError("Gagal mengirim link reset password. Silakan coba lagi.")
      console.error("Forgot password error:", error)
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    } finally {
      setIsLoading(false)
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
            Reset Password
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Masukkan email Anda untuk menerima link reset password
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="h-12"
                required
              />
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
                  Mengirim...
                </>
              ) : (
                "📧 Kirim Link Reset"
              )}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center">
            <button
              type="button"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali ke Login
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
