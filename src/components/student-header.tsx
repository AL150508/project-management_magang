"use client"

// Header untuk tampilan Siswa
// Layout: Logo + Role switcher di bawah (vertikal) | Profile di kanan

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

interface StudentHeaderProps {
  userName: string
  userRole: "siswa" | "guru"
  onRoleChange: (role: "siswa" | "guru") => void
}

export function StudentHeader({ userName, userRole, onRoleChange }: StudentHeaderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="w-full px-4 py-3 flex items-center justify-between border-b border-blue-100/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
                <div className="h-6 w-6 bg-white rounded animate-pulse"></div>
              </div>
          <div className="min-w-0">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="w-full px-4 py-3 flex items-center justify-between gap-4 border-b border-blue-100/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300 ease-in-out min-w-0">
      {/* Grup Kiri: Logo + Role Switcher (vertikal) */}
      <div className="flex items-start gap-3 min-w-0 flex-shrink">
        <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
              <IconSchool className="h-6 w-6 text-white" />
            </div>
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">
            Magang Portal
          </h1>
          {/* Role Switcher: Di bawah nama sekolah */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant={userRole === "siswa" ? "default" : "outline"}
              size="sm"
              onClick={() => onRoleChange("siswa")}
              className={`h-8 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${
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
              onClick={() => onRoleChange("guru")}
              className={`h-8 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${
                userRole === "guru" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                  : "border-blue-300 text-blue-600 hover:bg-blue-50"
              }`}
            >
              Guru
            </Button>
          </div>
        </div>
          </div>

      {/* Grup Kanan: Profile */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 rounded-full px-2 sm:px-3 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
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
                <p className="text-xs leading-none text-muted-foreground capitalize">{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  )
}
