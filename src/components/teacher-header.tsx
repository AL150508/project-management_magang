"use client"

// Header untuk tampilan Guru
// Mirip dengan `StudentHeader`, menampilkan:
// - Logo + judul aplikasi
// - Teks informasi di tengah (pada layar besar)
// - Pemilih peran (Siswa/Guru)
// - Menu profil pengguna (dropdown)
// Hanya menambah komentar penjelas; tidak mengubah logika.

import * as React from "react"
import { IconSchool, IconUser } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Properti yang dibutuhkan Header Guru
interface TeacherHeaderProps {
  userName: string
  userRole: "siswa" | "guru"
  onRoleChange: (role: "siswa" | "guru") => void
}

export function TeacherHeader({ userName, userRole, onRoleChange }: TeacherHeaderProps) {
  // `mounted` untuk mencegah mismatch render server vs client
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Tampilkan skeleton saat belum siap (placeholder konten)
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-blue-100/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-lg p-2">
                <div className="h-6 w-6 bg-white rounded animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Magang Portal Guru</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300 ease-in-out">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo dan Nama Aplikasi */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-2">
              <IconSchool className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Magang Portal Guru</h1>
            </div>
          </div>
        </div>

        {/* Teks Tengah */}
        <div className="hidden lg:block flex-1 text-center">
          <p className="text-sm text-gray-600 font-medium">
            SMK Brantas Karangkates
          </p>
        </div>

        {/* Profil User */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Role Selector: peralihan tampilan antara peran "Siswa" dan "Guru" */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant={userRole === "siswa" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log("Header: Switching to siswa")
                onRoleChange("siswa")
              }}
              className={`h-8 px-4 transition-all duration-200 ease-in-out ${
                userRole === "siswa" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                  : "border-blue-300 text-blue-600 hover:bg-blue-50"
              }`}
            >
              Siswa
            </Button>
            <Button
              variant={userRole === "guru" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log("Header: Switching to guru")
                onRoleChange("guru")
              }}
              className={`h-8 px-4 transition-all duration-200 ease-in-out ${
                userRole === "guru" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                  : "border-blue-300 text-blue-600 hover:bg-blue-50"
              }`}
            >
              Guru
            </Button>
          </div>

          {/* User Profile: dropdown dengan informasi singkat akun dan aksi umum */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 rounded-full px-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <IconUser className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {userRole}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
