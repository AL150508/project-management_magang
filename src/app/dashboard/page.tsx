"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { SectionCards } from "@/components/section-cards"
import { SectionLatestMagang, SectionLatestLogbook, SectionDudiAktif } from "@/components/dashboard/sections"
import { SectionProgressOverview } from "@/components/section-progress-overview"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

// Komponen utama halaman dashboard
export default function Page() {
  // Mengambil role user dari context (guru/siswa)
  const { role, setRole } = useRole()
  // State untuk item sidebar yang aktif
  const [activeItem, setActiveItem] = React.useState("dashboard")
  // State untuk cek apakah komponen sudah ter-mount (untuk mencegah error hydration)
  const [mounted, setMounted] = React.useState(false)
  // State untuk loading data dashboard
  const [isLoading, setIsLoading] = React.useState(true)

  // userName tidak digunakan lagi karena profile sudah dipindah ke sidebar

  // Menandai komponen sudah ter-mount dan simulate data loading
  React.useEffect(() => {
    setMounted(true)
    
    // Quick loading transition (reduced to not block real data)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [])

  // Fungsi untuk mengganti role user (guru/siswa)
  const handleRoleChange = (newRole: "siswa" | "guru") => {
    console.log("Role changing to:", newRole)
    setRole(newRole)
    // No need for reload - React state management handles the update
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
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar 
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader 
          userRole={role}
          onRoleChange={handleRoleChange}
        />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Dashboard
                </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  Selamat Datang di sistem Magang Siswa SMK Brantas Karangkates
                </p>
            </div>
            
          {/* Show skeleton while loading */}
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="flex flex-col gap-4 md:gap-6">
                  <SectionCards />
              <div className="grid gap-4 md:gap-6 md:grid-cols-3 items-start">
                <div className="md:col-span-2 flex flex-col gap-4 md:gap-6">
                        <SectionLatestMagang />
                        <SectionLatestLogbook />
                      </div>
                <div className="flex flex-col gap-4 md:gap-6">
                        <SectionProgressOverview />
                        <SectionDudiAktif />
                      </div>
                    </div>
                  </div>
          )}
        </main>
      </div>
    </div>
  )
}
