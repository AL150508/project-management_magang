"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { StudentHeader } from "@/components/student-header"
import { StudentSidebar } from "@/components/student-sidebar"
import { StudentDashboard } from "@/components/student-dashboard"
import { SectionCards } from "@/components/section-cards"
import { SectionLatestMagang, latestMagangDummy, SectionLatestLogbook, latestLogbookDummy, SectionDudiAktif } from "@/components/dashboard/sections"
import { SectionProgressOverview } from "@/components/section-progress-overview"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"

export default function HomePage() {
  const { role, setRole } = useRole()
  const [activeItem, setActiveItem] = React.useState("dashboard")
  const [mounted, setMounted] = React.useState(false)
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  // Calculate userName based on current role
  const userName = React.useMemo(() => {
    return role === "guru" ? "Guru Admin" : "Alvasya"
  }, [role])

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
    }, 150)
  }

  const handleItemClick = (item: string) => {
    setActiveItem(item)
  }

  // Prevent hydration mismatch by not rendering until mounted
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

  // Show transition loading when switching roles
  if (isTransitioning) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center pt-[env(safe-area-inset-top)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Switching role...</p>
        </div>
      </div>
    )
  }

  // Jika role adalah siswa, tampilkan layout siswa
  if (role === "siswa") {
    return (
      <div className="min-h-[100dvh] bg-gray-50 transition-all duration-300 ease-in-out pt-[env(safe-area-inset-top)]">
        <StudentHeader 
          userName={userName}
          userRole={role}
          onRoleChange={handleRoleChange}
        />
        <div className="flex">
          <StudentSidebar 
            activeItem={activeItem}
            onItemClick={handleItemClick}
          />
          <StudentDashboard 
            userName={userName}
          />
        </div>
      </div>
    )
  }

  // Jika role adalah guru, tampilkan layout admin/guru
  return (
    <div className="min-h-[100dvh] bg-gray-50 transition-all duration-300 ease-in-out pt-[env(safe-area-inset-top)]">
      <TeacherHeader 
        userName={userName}
        userRole={role}
        onRoleChange={handleRoleChange}
      />
      <div className="flex pt-2 sm:pt-0">
        <TeacherSidebar 
          activeItem={activeItem}
          onItemClick={handleItemClick}
        />
        <div className="flex-1">
          <div className="flex flex-1 flex-col">
            {/* Dashboard Header */}
            <div className="px-4 lg:px-6 py-8">
              <div className="max-w-4xl">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Dashboard Guru
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Selamat datang di sistem pelaporan magang siswa SMK Brantas Karangkates
                </p>
              </div>
            </div>
          
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <div className="grid gap-6 md:grid-cols-3 items-start">
                    <div className="md:col-span-2 flex flex-col gap-6">
                      <SectionLatestMagang items={latestMagangDummy} compact minHeightClass="min-h-[380px]" />
                      <SectionLatestLogbook items={latestLogbookDummy} minHeightClass="min-h-[380px]" />
                    </div>
                    <div className="flex flex-col gap-6">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}