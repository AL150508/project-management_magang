"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { HeaderGuru, SidebarGuru } from "@/components/guru"
import { HeaderSiswa, SidebarSiswa } from "@/components/siswa"
import { LogbookTable, LogbookModal } from "@/components/logbook"
import type { LogbookItem } from "@/components/logbook-table"
import { SectionLogbookCards } from "@/components/dashboard/sections"

// Halaman utama untuk manajemen logbook siswa magang
// Menampilkan tampilan berbeda untuk guru (admin) dan siswa
export default function LogbookPage() {
  const { role, setRole } = useRole() // Ambil role user dari context
  const [activeItem, setActiveItem] = React.useState("logbook") // Item sidebar yang aktif
  const [mounted, setMounted] = React.useState(false) // State untuk mencegah hydration mismatch
  const [modalOpen, setModalOpen] = React.useState(false) // Status modal logbook
  const [selectedLogbook, setSelectedLogbook] = React.useState<LogbookItem | null>(null) // Data logbook yang dipilih
  const [refreshKey, setRefreshKey] = React.useState(0) // Key untuk refresh tabel
  const [modalMode, setModalMode] = React.useState<"add" | "edit" | "review">("add") // Mode modal: tambah/edit/review

  // Hitung nama user berdasarkan role saat ini
  const userName = React.useMemo(() => {
    return role === "guru" ? "Guru Admin" : "Alvasya"
  }, [role])

  // Effect untuk menandai komponen sudah ter-mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Reset state modal saat role berubah
  React.useEffect(() => {
    setModalOpen(false)
    setSelectedLogbook(null)
  }, [role])

  // Handler untuk mengganti role user
  const handleRoleChange = (newRole: "siswa" | "guru") => {
    console.log("Role changing to:", newRole)
    setRole(newRole)
    // Refresh halaman setelah role change untuk memastikan semua komponen ter-update
    setTimeout(() => {
      window.location.reload()
    }, 200)
  }

  // Handler untuk klik item sidebar
  const handleItemClick = (item: string) => {
    setActiveItem(item)
  }

  // Handler untuk edit logbook
  const handleEdit = (logbook: LogbookItem) => {
    setSelectedLogbook(logbook)
    setModalMode("edit")
    setModalOpen(true)
  }

  // Handler untuk tambah logbook baru
  const handleAdd = () => {
    setSelectedLogbook(null)
    setModalMode("add")
    setModalOpen(true)
  }

  // Handler untuk review logbook (guru review)
  const handleReview = (logbook: LogbookItem) => {
    setSelectedLogbook(logbook)
    setModalMode("review")
    setModalOpen(true)
  }

  // Handler setelah modal berhasil disimpan
  const handleModalSuccess = () => {
    setRefreshKey((k) => k + 1) // Refresh tabel dengan key baru
  }

  // Tampilkan loading saat belum mounted (mencegah hydration mismatch)
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-[100dvh] min-w-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Render berdasarkan role user
  if (role === "guru") {
    // Tampilan untuk Guru/Admin - dengan tabel manajemen lengkap
    return (
      <div className="flex flex-col min-h-[100dvh] min-w-0 bg-gray-50 transition-all duration-300 ease-in-out">
        <HeaderGuru 
          userName={userName}
          userRole={role}
          onRoleChange={handleRoleChange}
        />
        <div className="flex flex-1 min-w-0">
          <SidebarGuru 
            activeItem={activeItem}
            onItemClick={handleItemClick}
          />
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-4">
            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                    Manajemen Logbook Siswa
                  </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    Kelola dan pantau logbook kegiatan magang siswa
                  </p>
              </div>
              
            <div className="flex flex-col gap-4 md:gap-6">
                  {/* Stats Cards - menampilkan statistik logbook */}
                  <SectionLogbookCards />

                    {/* Tabel logbook dengan fungsi edit dan review */}
                    <LogbookTable 
                      onEdit={handleEdit}
                      onView={handleReview}
                      refreshKey={refreshKey}
                    />
                  </div>
          </main>
        </div>

        {/* Modal untuk tambah/edit/review logbook */}
        <LogbookModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          logbook={selectedLogbook}
          onSuccess={handleModalSuccess}
          mode={modalMode}
        />
      </div>
    )
  }

  // Tampilan untuk Siswa - hanya logbook mereka sendiri
  return (
    <div className="flex flex-col min-h-[100dvh] min-w-0 bg-gray-50 transition-all duration-300 ease-in-out">
      <HeaderSiswa 
        userName={userName}
        userRole={role}
        onRoleChange={handleRoleChange}
      />
      <div className="flex flex-1 min-w-0">
        <SidebarSiswa 
          activeItem={activeItem}
          onItemClick={handleItemClick}
        />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-4">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Logbook Magang Saya</h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">Catat kegiatan harian dan kendala yang Anda hadapi selama magang</p>
              </div>
          
          <div className="flex flex-col gap-4 md:gap-6">
                  {/* Tabel logbook siswa dengan filter nama siswa */}
                  <LogbookTable 
                    onEdit={(item: LogbookItem)=>{ setSelectedLogbook(item); setModalMode("edit"); setModalOpen(true)}}
                    onAdd={handleAdd}
                    refreshKey={refreshKey}
                    studentNameFilter={userName} // Filter hanya logbook siswa ini
                  />
                </div>
        </main>
      </div>

      {/* Modal untuk tambah/edit logbook siswa */}
      <LogbookModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        logbook={selectedLogbook}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        defaultNamaSiswa={userName} // Default nama siswa untuk form baru
      />
    </div>
  )
}
