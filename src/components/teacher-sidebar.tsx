"use client"

// Sidebar untuk Guru - Modern Design dengan Collapsible
// Fitur:
// - Navigasi utama untuk peran guru (Dashboard, DUDI, Magang, Logbook)
// - Sidebar yang bisa expand/collapse dengan animasi smooth
// - Design modern dengan gradient dan shadows
// - Menyorot item aktif berdasarkan pathname (URL saat ini)
// - Navigasi client-side dengan Link dari next/link untuk SPA
// - Tidak ada full page reload saat navigasi

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconHome, IconBuilding, IconSchool, IconNotebook, IconX, IconMenu2, IconChalkboard } from "@tabler/icons-react"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"
import { cn, showConfirmation, showSuccess } from "@/lib & database connection/utils"
import { useAuth } from "@/context/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Properti yang diperlukan Sidebar Guru
interface TeacherSidebarProps {
  activeItem?: string // Opsional, karena sekarang menggunakan pathname
  onItemClick?: (item: string) => void // Opsional, untuk backward compatibility
}

// Daftar menu sisi guru: id, label, deskripsi, ikon, dan rute tujuan
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Ringkasan aktivitas",
    icon: IconHome,
    href: "/dashboard"
  },
  {
    id: "dudi",
    label: "DUDI",
    description: "Dunia Usaha & Industri",
    icon: IconBuilding,
    href: "/dudi"
  },
  {
    id: "magang",
    label: "Magang",
    description: "Data siswa magang & persetujuan",
    icon: IconSchool,
    href: "/magang"
  },
  {
    id: "logbook",
    label: "Logbook",
    description: "Catatan harian",
    icon: IconNotebook,
    href: "/logbook"
  }
]

export function TeacherSidebar({ activeItem, onItemClick }: TeacherSidebarProps) {
  const pathname = usePathname() // Ambil pathname saat ini untuk sinkronisasi aktif item
  const { user, logout } = useAuth()
  const [isExpanded, setIsExpanded] = React.useState(true) // Default expanded di desktop
  const [isMobile, setIsMobile] = React.useState(false)

  // Handle responsive behavior
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsExpanded(false) // Collapse di mobile
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handler untuk klik item (opsional, untuk backward compatibility)
  const handleItemClick = (item: { id: string; href: string }) => {
    if (onItemClick) {
      onItemClick(item.id)
    }
    // Auto collapse pada mobile setelah navigasi
    if (window.innerWidth < 768) {
      setIsExpanded(false)
    }
  }

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isExpanded && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "sticky top-0 flex h-screen flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex-shrink-0",
          isExpanded ? "w-64" : "w-16",
          isMobile && isExpanded && "fixed left-0 top-0 z-50"
        )}
        style={{ height: '100vh', minHeight: '100vh' }}
      >
        {/* Header - hanya tampil saat expanded */}
        {isExpanded && (
          <div className="flex items-center justify-between p-4 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <IconChalkboard className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Menu Guru</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors duration-200"
            >
              <IconX className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        )}
        
        {/* Toggle button untuk collapsed state */}
        {!isExpanded && (
          <div className="p-4 border-b border-slate-200/60">
            <button
              onClick={toggleSidebar}
              className="w-full p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 flex items-center justify-center"
            >
              <IconMenu2 className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <nav className={cn("space-y-2", isExpanded ? "px-4" : "px-2")}>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/") || activeItem === item.id
              
              if (isExpanded) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative",
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-700 hover:bg-blue-600 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                      isActive ? "bg-blue-500/20" : "bg-gray-100 group-hover:bg-blue-500/20"
                    )}>
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-600 group-hover:text-white")} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">{item.label}</span>
                      <span className={cn("text-xs truncate", isActive ? "text-blue-100" : "text-gray-500 group-hover:text-blue-100")}>
                        {item.description}
                      </span>
                    </div>
                  </Link>
                )
              } else {
                return (
                  <div key={item.id} className="relative group">
                    <Link
                      href={item.href}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 mx-auto",
                        isActive 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" 
                          : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  </div>
                )
              }
            })}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 mt-auto flex-shrink-0">
          {isExpanded ? (
            <div className="p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-800 truncate">Guru Admin</p>
                      <p className="text-xs text-gray-500">{user?.fullName || user?.username || "Administrator"}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">Guru Admin</span>
                      <span className="text-xs text-gray-500">{user?.fullName || user?.username || "Administrator"}</span>
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
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="p-4 flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm shadow-sm p-0"
                  >
                    {user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {user?.fullName?.charAt(0)?.toUpperCase() || "G"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">Guru Admin</span>
                      <span className="text-xs text-gray-500">{user?.fullName || user?.username || "Administrator"}</span>
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
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
