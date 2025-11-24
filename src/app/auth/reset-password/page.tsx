"use client"

export const dynamic = "force-dynamic"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { showSuccess, showError } from "@/lib & database connection/utils"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"

function ResetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isInitializing, setIsInitializing] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [formData, setFormData] = React.useState({
    password: "",
    confirmPassword: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // When arriving from Supabase email link, there may be an error or a one-time code
  // We need to exchange that code for a session before we can call auth.updateUser.
  React.useEffect(() => {
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const code = searchParams.get("code")

    const init = async () => {
      try {
        if (error) {
          const msg = decodeURIComponent(errorDescription || error)
          showError(`Link reset tidak valid atau sudah kedaluwarsa: ${msg}`)
          return
        }

        if (!code) {
          // No code in URL; user might have opened this page directly.
          return
        }

        if (!supabaseBrowser) {
          throw new Error("Supabase client not initialized")
        }

        const { error: exchangeError } = await supabaseBrowser.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          showError(`Tidak bisa memvalidasi link reset: ${exchangeError.message}`)
        }
      } catch (err) {
        console.error("❌ Error initializing reset password session:", err)
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memvalidasi link"
        showError(msg)
      } finally {
        setIsInitializing(false)
      }
    }

    // Run once on mount
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi password
    if (formData.password.length < 6) {
      showError("Password minimal 6 karakter")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Password dan konfirmasi password tidak sama")
      return
    }

    // Don't allow submit while we're still trying to initialize session
    if (isInitializing) return

    setIsLoading(true)
    try {
      console.log("🔐 Updating password...")

      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }

      // Update password for the user associated with the session created from the reset link
      const { error } = await supabaseBrowser.auth.updateUser({
        password: formData.password,
      })

      if (error) {
        throw error
      }

      console.log("✅ Password updated successfully")
      setIsSuccess(true)
      showSuccess("Password berhasil diubah!")

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("❌ Reset password error:", error)
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan"
      showError(`Gagal mengubah password: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Password Berhasil Diubah!
            </h1>
            <p className="text-gray-600">
              Anda akan diarahkan ke halaman login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Masukkan password baru Anda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Baru */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password Baru
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
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

          {/* Konfirmasi Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Konfirmasi Password Baru
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password baru"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="h-12 pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengubah Password...
              </>
            ) : (
              "🔒 Ubah Password"
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8">Loading...</div>}>
      <ResetPasswordPageContent />
    </React.Suspense>
  )
}
