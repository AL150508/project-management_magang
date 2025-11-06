"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { HeaderSiswa, SidebarSiswa } from "@/components/siswa"
import { HeaderGuru, SidebarGuru } from "@/components/guru"
import { DudiSearch, DudiCards, DudiTable } from "@/components/dudi"
import type { DudiItem } from "@/components/dudi-table"
import { DudiModal } from "@/components/dudi-modal"
import { toast } from "sonner"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"

export default function DudiPage() {
  const { role, setRole } = useRole()
  const [activeItem, setActiveItem] = React.useState("dudi")
  const [mounted, setMounted] = React.useState(false)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedDudi, setSelectedDudi] = React.useState<DudiItem | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const userName = React.useMemo(() => {
    return role === "guru" ? "Guru Pembimbing" : "Alvasya"
  }, [role])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setModalOpen(false)
    setSelectedDudi(null)
  }, [role])

  const handleRoleChange = (newRole: "siswa" | "guru") => {
    setRole(newRole)
    // Refresh halaman setelah role change untuk memastikan semua komponen ter-update
    setTimeout(() => {
      window.location.reload()
    }, 200)
  }

  const handleItemClick = (item: string) => {
    setActiveItem(item)
  }

  const handleEdit = (dudi: DudiItem) => {
    setSelectedDudi(dudi)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedDudi(null)
    setModalOpen(true)
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data DUDI ini?")) return
    
    try {
      if (!supabaseBrowser) {
        toast.error("Konfigurasi database tidak lengkap")
        return
      }
      
      const { error } = await supabaseBrowser
        .from("dudi")
        .delete()
        .eq("id", id)
      
      if (error) {
        console.error("Error deleting DUDI:", error)
        toast.error("Gagal menghapus data DUDI")
        return
      }
      
      toast.success("Data DUDI berhasil dihapus")
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error("Error deleting DUDI:", error)
      toast.error("Terjadi kesalahan saat menghapus data")
    }
  }

  const handleModalSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

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

  if (role === "guru") {
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
                    Manajemen DUDI
                  </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    Kelola data perusahaan mitra dan tempat magang siswa
                  </p>
              </div>
              
            <div className="flex flex-col gap-4 md:gap-6">
                    <DudiTable 
                      key={refreshKey}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAdd={handleAdd}
                    />
                  </div>
          </main>
        </div>

        <DudiModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          dudi={selectedDudi}
          onSuccess={handleModalSuccess}
        />
      </div>
    )
  }

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
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Cari Tempat Magang
              </h1>
            <p className="text-base sm:text-lg text-gray-600">
                Jelajahi perusahaan mitra dan daftarkan diri Anda untuk program magang
              </p>
            </div>

          <div className="flex flex-col gap-4 md:gap-6">
            <DudiSearch />
            <DudiCards />
          </div>
        </main>
      </div>
    </div>
  )
}