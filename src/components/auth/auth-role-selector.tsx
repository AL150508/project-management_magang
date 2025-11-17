"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GraduationCap, User, LogOut } from "lucide-react"
import { LoginModal } from "./login-modal"
import { RegisterModal } from "./register-modal"
import { ForgotPasswordModal } from "./forgot-password-modal"
import { showConfirmation, showSuccess } from "@/lib & database connection/utils"

export function AuthRoleSelector() {
  const { setRole } = useRole()
  const { user, isAuthenticated, logout } = useAuth()
  const [showRegister, setShowRegister] = React.useState(false)
  const [showForgotPassword, setShowForgotPassword] = React.useState(false)

  // Jika belum login, langsung tampilkan modal login
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-[100dvh] flex items-center justify-center p-4 pt-[env(safe-area-inset-top)] bg-white relative">
          {/* Branding di pojok kanan atas halaman */}
          <div className="absolute top-6 right-6 text-lg font-semibold modal-branding">
            Magang Portal
          </div>
          
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>

        <LoginModal
          isOpen={!isAuthenticated && !showRegister && !showForgotPassword}
          onClose={() => {}} // Tidak bisa ditutup jika belum login
          onSwitchToRegister={() => {
            setShowRegister(true)
          }}
          onSwitchToForgotPassword={() => {
            setShowForgotPassword(true)
          }}
        />

        <RegisterModal
          isOpen={showRegister}
          onClose={() => {
            setShowRegister(false)
          }}
          onSwitchToLogin={() => {
            setShowRegister(false)
          }}
        />

        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => {
            setShowForgotPassword(false)
          }}
          onBackToLogin={() => {
            setShowForgotPassword(false)
          }}
        />
      </>
    )
  }

  // Jika sudah login, tampilkan role selector
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-2xl">
        {/* User Info Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar} alt={user?.fullName || "User"} />
              <AvatarFallback className="text-lg">
                {user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-2xl font-bold mb-1">Selamat datang, {user?.fullName || "User"}!</h1>
          <p className="text-muted-foreground mb-2">Sistem Manajemen Magang</p>
          <p className="text-sm text-gray-600 mb-4">Pilih peran Anda untuk melanjutkan</p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              showConfirmation({
                message: "Apakah Anda yakin ingin keluar dari aplikasi?",
                onConfirm: async () => {
                  logout()
                  showSuccess("Berhasil keluar dari aplikasi")
                },
                confirmLabel: "Ya, Keluar",
                cancelLabel: "Batal",
                duration: 6000
              })
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
            onClick={() => setRole("guru")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-blue-700">Guru</CardTitle>
              <CardDescription>
                Akses untuk mengelola dan memantau kegiatan magang siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Melihat data siswa magang</li>
                <li>• Mengelola logbook siswa</li>
                <li>• Memberikan penilaian</li>
                <li>• Mengakses laporan</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-200"
            onClick={() => setRole("siswa")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-700">Siswa</CardTitle>
              <CardDescription>
                Akses untuk mengelola kegiatan magang dan logbook pribadi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Mengisi logbook harian</li>
                <li>• Melihat jadwal magang</li>
                <li>• Mengakses materi pembelajaran</li>
                <li>• Melihat progress magang</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
