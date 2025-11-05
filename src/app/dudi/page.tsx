"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { HeaderSiswa, SidebarSiswa } from "@/components/siswa"
import { HeaderGuru, SidebarGuru } from "@/components/guru"
import { DudiSearch, DudiCards, DudiTable } from "@/components/dudi"
import type { DudiItem } from "@/components/dudi-table"
import { DudiModal } from "@/components/dudi-modal"

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

  const handleDelete = (id: string | number) => {
    console.log("Delete DUDI with ID:", id)
  }

  const handleModalSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

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

  if (role === "guru") {
    return (
      <div className="min-h-[100dvh] bg-gray-50 transition-all duration-300 ease-in-out pt-[env(safe-area-inset-top)]">
        <HeaderGuru 
          userName={userName}
          userRole={role}
          onRoleChange={handleRoleChange}
        />
        <div className="flex pt-2 sm:pt-0">
          <SidebarGuru 
            activeItem={activeItem}
            onItemClick={handleItemClick}
          />
          <div className="flex-1">
            <div className="flex flex-1 flex-col">
              <div className="px-4 lg:px-6 py-8">
                <div className="max-w-4xl">
                  <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    Manajemen DUDI
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Kelola data perusahaan mitra dan tempat magang siswa
                  </p>
                </div>
              </div>
              
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <div className="px-4 lg:px-6">
                    <DudiTable 
                      key={refreshKey}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAdd={handleAdd}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    <div className="min-h-[100dvh] bg-gray-50 pt-[env(safe-area-inset-top)]">
      <HeaderSiswa 
        userName={userName}
        userRole={role}
        onRoleChange={handleRoleChange}
      />
      <div className="flex pt-2 sm:pt-0">
        <SidebarSiswa 
          activeItem={activeItem}
          onItemClick={handleItemClick}
        />
        <div className="flex-1 bg-gray-50/50">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cari Tempat Magang
              </h1>
              <p className="text-gray-600">
                Jelajahi perusahaan mitra dan daftarkan diri Anda untuk program magang
              </p>
            </div>

            <DudiSearch />
            <DudiCards />
          </div>
        </div>
      </div>
    </div>
  )
}