
"use client"

import * as React from "react"

// Type untuk role user dalam aplikasi
export type UserRole = "guru" | "siswa"

// Interface untuk context value
type RoleContextValue = {
  role: UserRole
  setRole: (r: UserRole) => void 
}

// Buat context untuk role management
const RoleContext = React.createContext<RoleContextValue | null>(null)

// Hook untuk menggunakan role context
// Wajib digunakan dalam komponen yang dibungkus RoleProvider
export function useRole() {
  const ctx = React.useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}

// Provider component untuk role management
// Membungkus seluruh aplikasi untuk mengelola state role
export function RoleProvider({ children }: { children: React.ReactNode }) {
  //untuk menyimpan role
  // Initialize dari localStorage atau default "guru"
  const [role, setRole] = React.useState<UserRole>(() => {
    if (typeof window === "undefined") return "guru" 
    return (localStorage.getItem("app_role") as UserRole) || "guru" 
  })

  // Simpan role ke localStorage setiap kali berubah
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_role", role) // Simpan ke browser storage
    }
  }, [role])

  // Provide context value ke semua child components
  return (
    <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
  )
}
