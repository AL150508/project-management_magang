"use client"

import * as React from "react"
import Link from "next/link"
import { type Icon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Komponen navigasi utama sidebar
// Menampilkan menu-menu utama aplikasi (Dashboard, DUDI, Magang, Logbook)
export function NavMain({
  items,
}: {
  items: {
    title: string // Judul menu (contoh: "Dashboard")
    url: string // URL tujuan (contoh: "/dashboard")
    icon?: Icon // Icon dari @tabler/icons-react
    subtitle?: string // Deskripsi singkat menu
  }[]
}) {
  const pathname = usePathname() // Ambil path URL saat ini untuk highlight menu aktif
  const [mounted, setMounted] = React.useState(false) // State untuk mencegah hydration mismatch
  
  React.useEffect(() => {
    setMounted(true) // Tandai komponen sudah ter-mount
  }, [])
  
  // Tampilkan skeleton loading saat belum mounted (untuk mencegah hydration error)
  if (!mounted) {
    return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="h-12 rounded-full px-4 transition-colors"
                  suppressHydrationWarning // Suppress warning untuk skeleton
                >
                  <Link href={item.url} className="flex w-full items-center gap-3">
                    {item.icon && (
                      <item.icon
                        width={20}
                        className="text-slate-500"
                      />
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold tracking-wide">{item.title}</span>
                      {item.subtitle && (
                        <span className="truncate text-xs text-slate-500">
                          {item.subtitle}
                        </span>
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }
  // Tampilan utama navigasi dengan highlight menu aktif
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title} // Tooltip saat hover
                isActive={pathname?.startsWith(item.url)} // Highlight jika URL saat ini dimulai dengan item.url
                className="h-12 rounded-full px-4 transition-colors hover:bg-blue-50 hover:text-blue-900 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
              >
                <Link href={item.url} className="flex w-full items-center gap-3">
                  {item.icon && (
                    <item.icon
                      width={20}
                      className="text-slate-500 data-[active=true]:text-white group-data-[state=open]:text-slate-500"
                    />
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold tracking-wide">{item.title}</span>
                    {item.subtitle && (
                      <span className="truncate text-xs text-slate-500 data-[active=true]:text-blue-100">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}