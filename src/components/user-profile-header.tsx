"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, ChevronDown } from "lucide-react"
import { showConfirmation, showSuccess } from "@/lib & database connection/utils"

interface UserProfileHeaderProps {
  role: "guru" | "siswa"
}

export function UserProfileHeader({ role }: UserProfileHeaderProps) {
  const { user, logout } = useAuth()

  if (!user) return null

  // Tentukan display name berdasarkan role
  const displayName = role === "guru" ? "Guru Admin" : (user.fullName || user.username || "User")
  const displaySubtext = role === "guru" ? user.fullName || user.username || "Administrator" : `@${user.username || "user"}`

  // Generate initials untuk avatar
  const initials = displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
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
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 h-auto p-2 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className="bg-blue-600 text-white font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-slate-900">
                {displayName}
              </span>
              <span className="text-xs text-slate-500">
                {displaySubtext}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback className="bg-blue-600 text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">
              {displayName}
            </span>
            <span className="text-xs text-slate-500">
              {displaySubtext}
            </span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <User className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          Pengaturan
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
