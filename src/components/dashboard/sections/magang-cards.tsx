/**
 * REFACTORED: Dashboard Section - Magang Cards
 * 
 * File: src/components/dashboard/sections/magang-cards.tsx
 * 
 * SEARCHABLE COMMENTS:
 * - REFACTORED_DASHBOARD_SECTION: Komponen section untuk menampilkan statistik magang
 * - DASHBOARD_MAGANG_STATS: Statistik total, aktif, selesai, pending magang
 * - DASHBOARD_MAGANG_CARDS: Card layout untuk statistik magang
 * - DASHBOARD_MAGANG_LOADING: Loading state untuk statistik magang
 * 
 * FUNGSI:
 * - Menampilkan statistik magang dalam bentuk cards
 * - Real-time update statistik dari database
 * - Loading state dengan skeleton animation
 * - Responsive grid layout
 */

"use client"

import * as React from "react"
import { IconUsers, IconSchool, IconCheck, IconClock } from "@tabler/icons-react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type MagangStats = {
  total: number
  aktif: number
  selesai: number
  pending: number
}

export function SectionMagangCards() {
  const [stats, setStats] = React.useState<MagangStats>({
    total: 0,
    aktif: 0,
    selesai: 0,
    pending: 0
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadStats()
  }, [])

  // DASHBOARD_MAGANG_STATS: Load statistik magang dari database
  const loadStats = async () => {
    try {
      setLoading(true)
      
      if (!supabaseBrowser) {
        console.error("Supabase is not configured")
        setStats({ total: 0, aktif: 0, selesai: 0, pending: 0 })
        return
      }
      
      const { data, error } = await supabaseBrowser
        .from("magang")
        .select("status")

      if (error) {
        console.error("Error loading magang stats:", error.message || error)
        return
      }

      // DASHBOARD_MAGANG_STATS: Calculate stats from data
      const total = data?.length || 0
      const aktif = data?.filter(item => item.status === "Aktif").length || 0
      const selesai = data?.filter(item => item.status === "Selesai").length || 0
      const pending = data?.filter(item => item.status === "Pending").length || 0

      setStats({ total, aktif, selesai, pending })
    } catch (error) {
      console.error("Error loading magang stats:", error instanceof Error ? error.message : error)
    } finally {
      setLoading(false)
    }
  }

  // DASHBOARD_MAGANG_LOADING: Loading state dengan skeleton animation
  if (loading) {
    return (
      <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-6 px-4 lg:px-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-sm backdrop-blur">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div className="flex-1">
                <div className="h-4 bg-blue-100/50 rounded animate-pulse mb-2" />
                <div className="h-8 bg-blue-100/50 rounded animate-pulse" />
              </div>
              <div className="bg-blue-100/50 rounded-xl w-10 h-10 animate-pulse" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  // DASHBOARD_MAGANG_CARDS: Card layout untuk statistik magang
  return (
    <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-6 px-4 lg:px-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory">
      {/* Total Siswa */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-sm backdrop-blur hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Total Siswa</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{stats.total}</CardTitle>
          </div>
          <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconUsers className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-blue-800/80 text-sm">Siswa magang terdaftar</div>
        </CardContent>
      </Card>

      {/* Aktif */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-sm backdrop-blur hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Aktif</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{stats.aktif}</CardTitle>
          </div>
          <div className="bg-cyan-500/15 text-cyan-600 ring-1 ring-cyan-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconSchool className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-blue-800/80 text-sm">Sedang magang</div>
        </CardContent>
      </Card>

      {/* Selesai */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-sm backdrop-blur hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Selesai</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{stats.selesai}</CardTitle>
          </div>
          <div className="bg-sky-500/15 text-sky-600 ring-1 ring-sky-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconCheck className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-blue-800/80 text-sm">Magang selesai</div>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-sm backdrop-blur hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Pending</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{stats.pending}</CardTitle>
          </div>
          <div className="bg-teal-500/15 text-teal-600 ring-1 ring-teal-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconClock className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-blue-800/80 text-sm">Menunggu penempatan</div>
        </CardContent>
      </Card>
    </div>
  )
}
