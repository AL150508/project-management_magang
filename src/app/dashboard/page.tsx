"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { SectionCards } from "@/components/section-cards"
import { SectionLatestMagang, SectionLatestLogbook, SectionDudiAktif } from "@/components/dashboard/sections"
import { SectionProgressOverview } from "@/components/section-progress-overview"

// Komponen utama halaman dashboard
export default function Page() {
  // Mengambil role user dari context (guru/siswa)
  const { role, setRole } = useRole()
  // State untuk item sidebar yang aktif
  const [activeItem, setActiveItem] = React.useState("dashboard")
  // State untuk cek apakah komponen sudah ter-mount (untuk mencegah error hydration)
  const [mounted, setMounted] = React.useState(false)

  // UBAH DI SINI: Nama user yang tampil di header, bisa diganti sesuai role
  const userName = React.useMemo(() => {
    return role === "guru" ? "Guru Admin" : "Alvasya" // UBAH DI SINI: Nama default user
  }, [role])

  // Menandai komponen sudah ter-mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Fungsi untuk mengganti role user (guru/siswa)
  const handleRoleChange = (newRole: "siswa" | "guru") => {
    console.log("Role changing to:", newRole) // Bisa dihapus jika tidak perlu log
    setRole(newRole)
    // Refresh halaman setelah role change untuk memastikan semua komponen ter-update
    setTimeout(() => {
      window.location.reload()
    }, 200)
  }

  // Fungsi untuk mengganti item sidebar yang aktif
  const handleItemClick = (item: string) => {
    setActiveItem(item)
  }

  // Bagian loading, muncul sebelum komponen siap (mounted)
  if (!mounted) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center pt-[env(safe-area-inset-top)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh] min-w-0 bg-gray-50 transition-all duration-300 ease-in-out">
      <TeacherHeader 
        userName={userName}
        userRole={role}
        onRoleChange={handleRoleChange}
      />
      <div className="flex flex-1 min-w-0">
        <TeacherSidebar 
          activeItem={activeItem}
          onItemClick={handleItemClick}
        />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-4">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Dashboard
                </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  Selamat Datang di sistem Magang Siswa SMK Brantas Karangkates
                </p>
            </div>
            
          <div className="flex flex-col gap-4 md:gap-6">
                <SectionCards />
            <div className="grid gap-4 md:gap-6 md:grid-cols-3 items-start">
              <div className="md:col-span-2 flex flex-col gap-4 md:gap-6">
                      <SectionLatestMagang compact minHeightClass="min-h-[380px]" />
                      <SectionLatestLogbook minHeightClass="min-h-[380px]" />
                    </div>
              <div className="flex flex-col gap-4 md:gap-6">
                      <SectionProgressOverview />
                      <SectionDudiAktif
                        items={[
                          { id: 1, name: "PT. Teknologi Nusantara", industry: "Teknologi Informasi", address: "Jl. HR Muhammad No. 123, Surabaya", phone: "031-5551234", count: 8 },
                          { id: 2, name: "CV. Digital Kreativa", industry: "Digital Marketing", address: "Jl. Pemuda No. 45, Surabaya", phone: "031-5557890", count: 5 },
                          { id: 3, name: "PT. Inovasi Mandiri", industry: "Konsultan IT", address: "Jl. Diponegoro No. 78, Surabaya", phone: "031-5553456", count: 12 },
                        ]}
                      />
                    </div>
                  </div>
                </div>
        </main>
      </div>
    </div>
  )
}
