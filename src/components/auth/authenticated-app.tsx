"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { useAuth } from "@/context/auth-context"
import { StudentHeader } from "@/components/student-header"
import { StudentSidebar } from "@/components/student-sidebar"
import { StudentDashboard } from "@/components/student-dashboard"
import { SectionCards } from "@/components/section-cards"
import { SectionLatestMagang, latestMagangDummy, SectionLatestLogbook, latestLogbookDummy, SectionDudiAktif } from "@/components/dashboard/sections"
import { SectionProgressOverview } from "@/components/section-progress-overview"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { AuthRoleSelector } from "./auth-role-selector"

export function AuthenticatedApp() {
  const { role, setRole } = useRole()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeItem, setActiveItem] = React.useState("dashboard")
  const [mounted, setMounted] = React.useState(false)
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  // Calculate userName based on current user and role
  const userName = React.useMemo(() => {
    if (!user) return role === "guru" ? "Guru Admin" : "Siswa"
    return user.fullName || user.username || (role === "guru" ? "Guru Admin" : "Siswa")
  }, [role, user])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleRoleChange = (newRole: "siswa" | "guru") => {
    console.log("Role changing to:", newRole)
    setIsTransitioning(true)
    setRole(newRole)
    setTimeout(() => {
      setActiveItem("dashboard")
      setIsTransitioning(false)
    }, 200)
  }

  const handleItemClick = (item: string) => {
    setActiveItem(item)
  }

  // Show loading during auth check or mounting
  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col min-h-[100dvh] min-w-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show role selector if not authenticated or no role selected
  if (!isAuthenticated) {
    return <AuthRoleSelector />
  }

  // Show transition loading when switching roles
  if (isTransitioning) {
    return (
      <div className="flex flex-col min-h-[100dvh] min-w-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Switching role...</p>
        </div>
      </div>
    )
  }

  // Jika role adalah siswa, tampilkan layout siswa
  if (role === "siswa") {
    return (
      <div className="flex flex-col min-h-[100dvh] min-w-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 transition-all duration-300 ease-in-out">
        <StudentHeader 
          userRole={role}
          onRoleChange={handleRoleChange}
        />
        <div className="flex flex-1 min-w-0">
          <StudentSidebar 
            activeItem={activeItem}
            onItemClick={handleItemClick}
          />
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-slate-50/50 to-transparent">
            <StudentDashboard 
              userName={userName}
            />
          </main>
        </div>
      </div>
    )
  }

  // Jika role adalah guru, tampilkan layout admin/guru
  return (
    <div className="flex flex-col min-h-[100dvh] min-w-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 transition-all duration-300 ease-in-out">
      <TeacherHeader 
        userRole={role}
        onRoleChange={handleRoleChange}
      />
      <div className="flex flex-1 min-w-0">
        <TeacherSidebar 
          activeItem={activeItem}
          onItemClick={handleItemClick}
        />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-slate-50/50 to-transparent">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Dashboard Guru
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Selamat datang di sistem pelaporan magang siswa SMK Brantas Karangkates
            </p>
          </div>
          
          <div className="flex flex-col gap-4 md:gap-6">
            <SectionCards />
            <div className="grid gap-4 md:gap-6 md:grid-cols-3 items-start">
              <div className="md:col-span-2 flex flex-col gap-4 md:gap-6">
                <SectionLatestMagang items={latestMagangDummy} compact minHeightClass="min-h-[380px]" />
                <SectionLatestLogbook items={latestLogbookDummy} minHeightClass="min-h-[380px]" />
              </div>
              <div className="flex flex-col gap-4 md:gap-6">
                <SectionProgressOverview activeInternPercent={80} logbookTodayPercent={71} />
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
