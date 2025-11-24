"use client"

import * as React from "react"
import { useRole } from "@/context/role-context"
import { HeaderGuru, SidebarGuru } from "@/components/guru"
import { HeaderSiswa, SidebarSiswa } from "@/components/siswa"
import { ProfileView } from "@/components/profile/profile-view"
import { ProfileEdit } from "@/components/profile/profile-edit"
import { ProfileSkeleton } from "@/components/profile-skeleton"

export default function ProfilePage() {
  const { role, setRole } = useRole()
  const [activeItem, setActiveItem] = React.useState("profile")
  const [mounted, setMounted] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
    
    // Quick loading transition (reduced to not block real data)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 150)
    
    return () => clearTimeout(timer)
  }, [])

  const handleRoleChange = (newRole: "siswa" | "guru") => {
    setRole(newRole)
  }

  const handleItemClick = (item: string) => {
    setActiveItem(item)
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (role === "guru") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarGuru activeItem={activeItem} onItemClick={handleItemClick} />
        <div className="flex-1 flex flex-col min-w-0">
          <HeaderGuru userRole={role} onRoleChange={handleRoleChange} />
          <main className="flex-1">
            {isLoading ? (
              <ProfileSkeleton />
            ) : isEditing ? (
              <ProfileEdit
                onSave={() => setIsEditing(false)}
              />
            ) : (
              <ProfileView onEditClick={() => setIsEditing(true)} />
            )}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarSiswa activeItem={activeItem} onItemClick={handleItemClick} />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderSiswa userRole={role} onRoleChange={handleRoleChange} />
        <main className="flex-1">
          {isLoading ? (
            <ProfileSkeleton />
          ) : isEditing ? (
            <ProfileEdit
              onSave={() => setIsEditing(false)}
            />
          ) : (
            <ProfileView onEditClick={() => setIsEditing(true)} />
          )}
        </main>
      </div>
    </div>
  )
}