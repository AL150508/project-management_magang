"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRole } from "@/context/role-context"

export function SiteHeader() {
  const { role, setRole } = useRole()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Sub-components (internal only)
  function Title() {
    return <h1 className="text-base font-medium">SMK BRANTAS KARANGKATES</h1>
  }

  function RoleBadge() {
    return (
      <span
        className="bg-blue-500/10 text-blue-700 ring-1 ring-blue-200/60 hidden items-center gap-2 rounded-md px-2 py-1 text-xs font-medium sm:flex"
        suppressHydrationWarning
      >
        Peran: {mounted ? (role === "guru" ? "Guru" : "Siswa") : "..."}
      </span>
    )
  }

  function RoleToggle() {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setRole(role === "guru" ? "siswa" : "guru")}
        disabled={!mounted}
        suppressHydrationWarning
      >
        {mounted ? (role === "guru" ? "Switch ke Siswa" : "Switch ke Guru") : "Memuat..."}
      </Button>
    )
  }
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Title />
        <div className="ml-auto flex items-center gap-2">
          <RoleBadge />
          <RoleToggle />
        </div>
      </div>
    </header>
  )
}
