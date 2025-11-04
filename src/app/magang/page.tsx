"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { TeacherHeader, TeacherSidebar, MagangTable, MagangItem, MagangModal } from "@/components/guru"
import { StudentHeader, StudentSidebar, StatusMagangSiswa } from "@/components/siswa"
import { SectionMagangCards } from "@/components/dashboard/sections"
import { NilaiMagangModal } from "@/components/nilai-magang-modal"

// Halaman utama untuk manajemen data siswa magang
// Menampilkan tampilan berbeda untuk guru (admin) dan siswa
export default function MagangPage() {
  const { role, setRole } = useRole() // Ambil role user dari context
  const [activeItem, setActiveItem] = React.useState("magang") // Item sidebar yang aktif
  const [mounted, setMounted] = React.useState(false) // State untuk mencegah hydration mismatch
  const [modalOpen, setModalOpen] = React.useState(false) // Status modal tambah/edit magang
  const [selectedMagang, setSelectedMagang] = React.useState<MagangItem | null>(null) // Data magang yang dipilih untuk edit
  const [refreshKey, setRefreshKey] = React.useState(0) // Key untuk refresh tabel
  const [nilaiModalOpen, setNilaiModalOpen] = React.useState(false) // Status modal nilai magang
  const [selectedNilaiMagang, setSelectedNilaiMagang] = React.useState<MagangItem | null>(null) // Data magang untuk modal nilai

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
    setSelectedMagang(null)
    setNilaiModalOpen(false)
    setSelectedNilaiMagang(null)
  }, [role])

  // Handler untuk mengganti role user
  const handleRoleChange = (newRole: "siswa" | "guru") => {
    console.log("Role changing to:", newRole)
    setRole(newRole)
  }

  // Handler untuk klik item sidebar
  const handleItemClick = (item: string) => {
    setActiveItem(item)
  }

  // Handler untuk edit data magang
  const handleEdit = (magang: MagangItem) => {
    setSelectedMagang(magang)
    setModalOpen(true)
  }

  // Handler untuk tambah data magang baru
  const handleAdd = () => {
    setSelectedMagang(null)
    setModalOpen(true)
  }

  // Handler setelah modal berhasil disimpan
  const handleModalSuccess = () => {
    setRefreshKey((k) => k + 1) // Refresh tabel dengan key baru
  }

  // Handler untuk buka modal nilai magang
  const handleNilai = (magang: MagangItem) => {
    setSelectedNilaiMagang(magang)
    setNilaiModalOpen(true)
  }

  // Handler setelah modal nilai berhasil disimpan
  const handleNilaiSuccess = () => {
    setRefreshKey((k) => k + 1) // Refresh tabel dengan key baru
  }

  // Tampilkan loading saat belum mounted (mencegah hydration mismatch)
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

  // Render berdasarkan role user
  if (role === "guru") {
    // Tampilan untuk Guru/Admin - dengan tabel manajemen lengkap
    return (
      <div className="min-h-[100dvh] bg-gray-50 transition-all duration-300 ease-in-out pt-[env(safe-area-inset-top)]">
        <TeacherHeader 
          userName={userName}
          userRole={role}
          onRoleChange={handleRoleChange}
        />
        <div className="flex">
          <TeacherSidebar 
            activeItem={activeItem}
            onItemClick={handleItemClick}
          />
          <div className="flex-1">
            <div className="flex flex-1 flex-col">
              {/* Header Section */}
              <div className="px-4 lg:px-6 py-8">
                <div className="max-w-4xl">
                  <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    Manajemen Siswa Magang
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Kelola data siswa yang sedang melaksanakan magang di industri
                  </p>
                </div>
              </div>
              
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {/* Stats Cards - menampilkan statistik magang */}
                  <SectionMagangCards />

                  {/* Magang Table - tabel data siswa magang */}
                  <div className="px-4 lg:px-6">
                    <MagangTable 
                      onEdit={handleEdit}
                      onAdd={handleAdd}
                      onNilai={handleNilai}
                      refreshKey={refreshKey}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals untuk tambah/edit data magang */}
        <MagangModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          magang={selectedMagang}
          onSuccess={handleModalSuccess}
        />
        
        {/* Modal untuk input nilai magang */}
        <NilaiMagangModal
          open={nilaiModalOpen}
          onOpenChange={setNilaiModalOpen}
          magangData={selectedNilaiMagang ? {
            id: selectedNilaiMagang.id,
            namaSiswa: selectedNilaiMagang.nama_siswa,
            namaPerusahaan: selectedNilaiMagang.nama_dudi || "",
            periodeMulai: selectedNilaiMagang.periode_mulai || "",
            periodeSelesai: selectedNilaiMagang.periode_selesai || "",
            nilaiAkhir: selectedNilaiMagang.nilai
          } : undefined}
          onSuccess={handleNilaiSuccess}
        />
      </div>
    )
  }

  // Tampilan untuk Siswa - hanya status magang mereka
  return (
    <div className="min-h-[100dvh] bg-gray-50 pt-[env(safe-area-inset-top)]">
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
        <div className="flex-1 bg-gray-50/50">
          <div className="container mx-auto px-4 py-8">
            <StatusMagangSiswa studentName={userName} />
          </div>
        </div>
      </div>
    </div>
  )
}
