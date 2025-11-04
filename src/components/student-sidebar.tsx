"use client"

// Sidebar untuk Siswa
// Fitur:
// - Navigasi utama (Dashboard, DUDI, Magang, Logbook)
// - Menandai item aktif berdasarkan pathname (URL saat ini)
// - Navigasi client-side dengan Link dari next/link untuk SPA
// - Tidak ada full page reload saat navigasi

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconHome, IconBuilding, IconSchool, IconNotebook } from "@tabler/icons-react"
import { cn } from "@/lib & database connection/utils"

// Properti yang diperlukan Sidebar Siswa
interface StudentSidebarProps {
  activeItem?: string // Opsional, karena sekarang menggunakan pathname
  onItemClick?: (item: string) => void // Opsional, untuk backward compatibility
}

// Daftar menu: id (penanda), label (judul), description (subjudul), icon, dan href (tujuan)
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Ringkasan aktivitas",
    icon: IconHome,
    href: "/"
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
    description: "Data magang saya",
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

export function StudentSidebar({ activeItem, onItemClick }: StudentSidebarProps) {
  const pathname = usePathname() // Ambil pathname saat ini untuk sinkronisasi aktif item

  // Handler untuk klik item (opsional, untuk backward compatibility)
  const handleItemClick = (item: { id: string; href: string }) => {
    if (onItemClick) {
      onItemClick(item.id)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-blue-100/60 transition-all duration-300 ease-in-out">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon // komponen ikon untuk item ini
            // Gunakan pathname sebagai sumber kebenaran, fallback ke activeItem jika pathname tidak tersedia
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/") || activeItem === item.id
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-all hover:bg-blue-50",
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-gray-700 hover:text-blue-600"
                )}
              >                                                            
                <Icon 
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"
                  )} 
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className={cn(
                    "text-xs truncate",
                    isActive ? "text-blue-100" : "text-gray-500 group-hover:text-blue-500"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
