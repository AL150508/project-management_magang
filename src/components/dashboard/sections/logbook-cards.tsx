/**
 * REFACTORED: Dashboard Section - Logbook Cards
 * 
 * File: src/components/dashboard/sections/logbook-cards.tsx
 * 
 * SEARCHABLE COMMENTS:
 * - REFACTORED_DASHBOARD_SECTION: Komponen section untuk menampilkan statistik logbook
 * - DASHBOARD_LOGBOOK_STATS: Statistik total, disetujui, ditolak, belum diverifikasi logbook
 * - DASHBOARD_LOGBOOK_CARDS: Card layout untuk statistik logbook
 * - DASHBOARD_LOGBOOK_LOADING: Loading state untuk statistik logbook
 * 
 * FUNGSI:
 * - Menampilkan statistik logbook dalam bentuk cards
 * - Real-time update statistik dari database
 * - Loading state dengan skeleton animation
 * - Responsive grid layout
 */

"use client"

import * as React from "react"
import { IconNotebook, IconCheck, IconClock, IconX } from "@tabler/icons-react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type LogbookStats = {
  total: number
  disetujui: number
  ditolak: number
  belum_diverifikasi: number
}

export function SectionLogbookCards() {
  const [stats, setStats] = React.useState<LogbookStats>({
    total: 0,
    disetujui: 0,
    ditolak: 0,
    belum_diverifikasi: 0
  })
  const [loading, setLoading] = React.useState(true)

  // Load stats dan subscribe ke perubahan realtime
  React.useEffect(() => {
    // Load data pertama kali
    loadStats()
    
    // Subscribe ke perubahan data realtime
    if (!supabaseBrowser) return
    
    const subscription = supabaseBrowser
      .channel('logbook_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'logbook'
        }, 
        () => loadStats()
      )
      .subscribe()

    // Cleanup subscription saat komponen unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // DASHBOARD_LOGBOOK_STATS: Load statistik logbook dari database
  const loadStats = async () => {
    try {
      setLoading(true)
      
      if (!supabaseBrowser) {
        console.warn("Supabase is not configured, using empty stats")
        setStats({ total: 0, disetujui: 0, ditolak: 0, belum_diverifikasi: 0 })
        setLoading(false)
        return
      }

      // Ambil semua data status dari tabel logbook
      const { data, error } = await supabaseBrowser
        .from("logbook")
        .select("status")

      if (error) {
        console.error("Error loading logbook data:", error)
        setStats({ total: 0, disetujui: 0, ditolak: 0, belum_diverifikasi: 0 })
        setLoading(false)
        return
      }

      // Hitung statistik dari data
      const logbookData = data || []
      const total = logbookData.length
      const disetujui = logbookData.filter(d => d.status === 'Disetujui').length
      const ditolak = logbookData.filter(d => d.status === 'Ditolak').length
      const belum_diverifikasi = logbookData.filter(d => d.status === 'Belum Diverifikasi').length

      // Update state dengan hasil perhitungan
      setStats({
        total,
        disetujui,
        ditolak,
        belum_diverifikasi
      })
    } catch (error) {
      console.error("Error loading logbook stats:", error instanceof Error ? error.message : error)
      setStats({ total: 0, disetujui: 0, ditolak: 0, belum_diverifikasi: 0 })
    } finally {
      setLoading(false)
    }
  }

  // DASHBOARD_LOGBOOK_LOADING: Loading state dengan skeleton animation
  if (loading) {
    return (
      <div className="grid w-full min-w-0 grid-flow-col auto-cols-[minmax(200px,1fr)] sm:auto-cols-[minmax(260px,1fr)] gap-6 px-4 lg:px-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur">
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

  // DASHBOARD_LOGBOOK_CARDS: Card layout untuk statistik logbook
  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Total Logbook */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Total Logbook</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{stats.total}</CardTitle>
          </div>
          <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconNotebook className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-blue-800/80 text-sm">Laporan masuk hari ini</div>
        </CardContent>
      </Card>

      {/* Disetujui */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Disetujui</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{stats.disetujui}</CardTitle>
          </div>
          <div className="bg-green-500/15 text-green-600 ring-1 ring-green-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconCheck className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-blue-800/80 text-sm">Laporan disetujui</div>
        </CardContent>
      </Card>

      {/* Ditolak */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Ditolak</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{stats.ditolak}</CardTitle>
          </div>
          <div className="bg-red-500/15 text-red-600 ring-1 ring-red-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconX className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-blue-800/80 text-sm">Perlu perbaikan</div>
        </CardContent>
      </Card>

      {/* Belum Diverifikasi */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Belum Diverifikasi</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{stats.belum_diverifikasi}</CardTitle>
          </div>
          <div className="bg-yellow-500/15 text-yellow-600 ring-1 ring-yellow-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconClock className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-blue-800/80 text-sm">Menunggu review</div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
