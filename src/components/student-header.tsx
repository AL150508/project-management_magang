"use client"

// Header untuk tampilan Siswa
// Layout: Logo + Role switcher di bawah (vertikal) | Profile di kanan

import * as React from "react"
import { IconSchool } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib & database connection/utils"

interface StudentHeaderProps {
  userRole: "siswa" | "guru"
  onRoleChange: (role: "siswa" | "guru") => void
}

export function StudentHeader({ userRole, onRoleChange }: StudentHeaderProps) {
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
    <header className="w-full px-4 py-3 flex items-center justify-between gap-4 bg-white border-b border-slate-200/60 shadow-sm transition-all duration-300 ease-in-out min-w-0">
      {/* Mobile: Hamburger + Brand Name */}
      <div className="flex md:hidden items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <IconSchool className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-800 truncate">Magang Portal</h1>
          </div>
        </div>
      </div>

      {/* Desktop: Logo Kiri */}
      <div className="hidden md:flex items-center gap-3 min-w-0 flex-shrink">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-3 flex-shrink-0 shadow-lg shadow-blue-600/25">
          <IconSchool className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 whitespace-nowrap">
            Magang Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">SMK Brantas Karangkates</p>
        </div>
      </div>

      {/* Role Switcher - Desktop dan Mobile */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-slate-200 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRoleChange("siswa")}
          className={cn(
            "h-7 md:h-8 px-2 md:px-4 text-xs font-medium transition-all duration-200 rounded-md",
            userRole === "siswa" 
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25" 
              : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
          )}
        >
          Siswa
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRoleChange("guru")}
          className={cn(
            "h-7 md:h-8 px-2 md:px-4 text-xs font-medium transition-all duration-200 rounded-md",
            userRole === "guru" 
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25" 
              : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
          )}
        >
          Guru
        </Button>
      </div>
    </header>
  )
}
