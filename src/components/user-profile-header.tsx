"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, ChevronDown } from "lucide-react"
import { NotificationToggle } from "@/components/notification-toggle"
import { showConfirmation, showSuccess } from "@/lib & database connection/utils"

interface UserProfileHeaderProps {
  role: "guru" | "siswa"
}

export function UserProfileHeader({ role }: UserProfileHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  // Generate initials from user name
  const getInitials = () => {
    if (!user) return "?"
    const name = user.fullName || user.username || "User"
    return name.charAt(0).toUpperCase()
  }

  // Display name berdasarkan role
  const displayName = React.useMemo(() => {
    if (role === "guru") {
      return "Guru Admin"
    }
    return user?.fullName || user?.username || "Siswa"
  }, [role, user])

  // Display subtext berdasarkan role
  const displaySubtext = React.useMemo(() => {
    if (role === "guru") {
      return user?.fullName || user?.username || "Administrator"
    }
    return `@${user?.username || "user"}`
  }, [role, user])

  const handleNavigateToProfile = () => {
    router.push("/profile")
  }

  const handleNavigateToSettings = () => {
    router.push("/profile") // Same as profile for now
  }

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

  // Add cache busting to avatar URL
  const avatarUrl = user?.avatar ? `${user.avatar}?t=${Date.now()}` : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={user?.fullName || "User"} key={user?.avatar} />
            <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 p-2">
        {/* User Info Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} alt={user?.fullName || "User"} key={user?.avatar} />
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-base font-semibold text-slate-900 truncate">
              {displayName}
            </span>
            <span className="text-sm text-slate-500 truncate">
              {displaySubtext}
            </span>
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-2" />
        
        {/* Profile Menu Item */}
        <DropdownMenuItem 
          className="cursor-pointer px-3 py-2 rounded-md transition-colors hover:bg-slate-100 focus:bg-slate-100"
          onSelect={handleNavigateToProfile}
        >
          <User className="h-5 w-5 mr-3 text-slate-600" />
          <span className="text-sm font-medium text-slate-900">Profile</span>
        </DropdownMenuItem>
        
        {/* Pengaturan Menu Item */}
        <DropdownMenuItem 
          className="cursor-pointer px-3 py-2 rounded-md transition-colors hover:bg-slate-100 focus:bg-slate-100"
          onSelect={handleNavigateToSettings}
        >
          <Settings className="h-5 w-5 mr-3 text-slate-600" />
          <span className="text-sm font-medium text-slate-900">Pengaturan</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-2" />
        
        {/* Notification Toggle */}
        <div className="px-1 py-1">
          <NotificationToggle />
        </div>
        
        <DropdownMenuSeparator className="my-2" />
        
        {/* Keluar Menu Item */}
        <DropdownMenuItem 
          className="cursor-pointer px-3 py-2 rounded-md transition-colors hover:bg-red-50 focus:bg-red-50"
          onSelect={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3 text-red-600" />
          <span className="text-sm font-medium text-red-600">Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
