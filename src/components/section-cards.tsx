"use client"
import * as React from "react"
import { IconUsers, IconBuildingSkyscraper, IconSchool, IconNotebook, IconTrendingUp } from "@tabler/icons-react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function SectionCards() {
  const [totalSiswa, setTotalSiswa] = React.useState(0)
  const [totalDudi, setTotalDudi] = React.useState(0)
  const [aktifMagang, setAktifMagang] = React.useState(0)
  const [totalLogbook, setTotalLogbook] = React.useState(0)

  const loadCounts = React.useCallback(async () => {
    try {
      if (!supabaseBrowser) return
      // magang total siswa
      const magangCountRes = await supabaseBrowser
        .from("magang")
        .select("*", { count: "exact", head: true })
      setTotalSiswa(magangCountRes.count || 0)

      // dudi partner
      const dudiCountRes = await supabaseBrowser
        .from("dudi")
        .select("*", { count: "exact", head: true })
      setTotalDudi(dudiCountRes.count || 0)

      // siswa magang aktif (status = 'Aktif' jika ada)
      const aktifRes = await supabaseBrowser
        .from("magang")
        .select("status", { count: "exact", head: true })
        .eq("status", "Aktif")
      setAktifMagang(aktifRes.count || 0)

      // total logbook (asumsi tabel bernama 'logbook')
      const logbookRes = await supabaseBrowser
        .from("logbook")
        .select("*", { count: "exact", head: true })
      setTotalLogbook(logbookRes.count || 0)
    } catch (err) {
      console.error("Gagal memuat statistik dashboard:", err)
    }
  }, [])

  React.useEffect(() => {
    loadCounts()
  }, [loadCounts])

  // Realtime subscription untuk menyegarkan angka
  React.useEffect(() => {
    if (!supabaseBrowser) return
    const channel = supabaseBrowser!
      .channel("realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "magang" }, loadCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "dudi" }, loadCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "logbook" }, loadCounts)
      .subscribe()
    return () => {
      supabaseBrowser!.removeChannel(channel)
    }
  }, [loadCounts])

  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Total Siswa */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Total siswa</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{totalSiswa}</CardTitle>
          </div>
          <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconUsers className="size-5" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-blue-800/80">Seluruh Siswa Terdaftar</div>
        </CardFooter>
      </Card>

      {/* Dudi Partner */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Dudi Partner</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{totalDudi}</CardTitle>
          </div>
          <div className="bg-cyan-500/15 text-cyan-600 ring-1 ring-cyan-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconBuildingSkyscraper className="size-5" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-blue-800/80">Perusahaan Mitra</div>
        </CardFooter>
      </Card>

      {/* Siswa Magang */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Siswa Magang</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{aktifMagang}</CardTitle>
          </div>
          <div className="bg-sky-500/15 text-sky-600 ring-1 ring-sky-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconSchool className="size-5" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-blue-800/80">Sedang aktif magang</div>
        </CardFooter>
      </Card>

      {/* Logbook */}
      <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription className="text-blue-700/80">Logbook</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{totalLogbook}</CardTitle>
          </div>
          <div className="bg-teal-500/15 text-teal-600 ring-1 ring-teal-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
            <IconNotebook className="size-5" />
          </div>
          <CardAction>
            <Badge variant="outline" className="border-blue-200/60 text-blue-700 bg-blue-50">{totalLogbook}</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-blue-800/80 flex items-center gap-1.5">
            Laporan masuk hari ini <IconTrendingUp className="size-4 text-blue-600" />
          </div>
        </CardFooter>
      </Card>
      </div>
    </div>
  )
}