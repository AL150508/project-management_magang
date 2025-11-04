"use client"

import * as React from "react"
import Link from "next/link"
// Icon di bawah ini berasal dari library eksternal @tabler/icons-react
import { IconChartBar, IconDashboard, IconFolder, IconInnerShadowTop, IconListDetails } from "@tabler/icons-react"

// Komponen NavMain diimpor dari src/components/nav-main.tsx
import { NavMain } from "@/components/nav-main"
// Komponen NavUser diimpor dari src/components/nav-user.tsx
import { NavUser } from "@/components/nav-user"
// Komponen Sidebar dan turunannya diimpor dari src/components/ui/sidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Data sidebar, bisa Anda ubah untuk menambah menu atau mengganti user
const data = {
  user: {
    name: "SMK BRANTAS KARANGKATES", // UBAH DI SINI: Nama user
    email: "m@example.com",           // UBAH DI SINI: Email user
    avatar: "/avatars/shadcn.jpg",    // UBAH DI SINI: Path avatar user
  },
  navMain: [
    {
      title: "Dashboard",             // UBAH DI SINI: Judul menu
      subtitle: "Ringkasan aktivitas",// UBAH DI SINI: Deskripsi menu
      url: "/dashboard",              // UBAH DI SINI: Link menu
      icon: IconDashboard,            // UBAH DI SINI: Icon menu
    },
    {
      title: "DUDI",
      subtitle: "Dunia Usaha & Industri",
      url: "/dudi",
      icon: IconListDetails,
    },
    {
      title: "Magang",
      subtitle: "Data siswa magang",
      url: "/magang",
      icon: IconFolder,
    },
    {
      title: "Logbook",
      subtitle: "Catatan harian",
      url: "/logbook",
      icon: IconChartBar,
    },
    // TAMBAH DI SINI: Untuk menambah item menu baru
  ],
}

// Komponen utama sidebar aplikasi
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    // Komponen Sidebar berasal dari src/components/ui/sidebar.tsx
    <Sidebar collapsible="offcanvas" className="bg-white border-r border-slate-200" {...props}>
      {/* TIP: Atur perilaku collapsible via props Sidebar ("offcanvas" | "icon" | "none"). */}
      {/* Jika ingin mengubah warna/border default, modifikasi className di sini. */}
      {/* SidebarHeader berasal dari src/components/ui/sidebar.tsx */}
      <SidebarHeader className="bg-white"> 
        {/* SidebarMenu dan SidebarMenuItem juga dari src/components/ui/sidebar.tsx */}
        <SidebarMenu>
          <SidebarMenuItem>
            {/* SidebarMenuButton dari src/components/ui/sidebar.tsx */}
            {/* IconInnerShadowTop dari @tabler/icons-react */}
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5" >
              {/* NOTE: Gunakan asChild agar Link menjadi elemen utama tombol (DOM bersih). */}
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">MAGANG</span>
              </Link>
            </SidebarMenuButton>
            {/* Ubah label "MAGANG" atau ikon di atas untuk branding aplikasi. */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* SidebarContent dari src/components/ui/sidebar.tsx */}
      <SidebarContent className="bg-white">
        {/* Komponen NavMain dari src/components/nav-main.tsx, menerima data.navMain sebagai props */}
        {/* Jika menambah/ubah menu, edit array data.navMain di atas. */}
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* SidebarFooter dari src/components/ui/sidebar.tsx */}
      <SidebarFooter  className="bg-white border-t border-slate-200">
        {/* Komponen NavUser dari src/components/nav-user.tsx, menerima data.user sebagai props */}
        {/* Jika mengganti user/avatar/email, ubah object data.user di atas. */}
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
