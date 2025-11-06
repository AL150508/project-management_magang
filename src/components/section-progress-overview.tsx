import { IconChartBar } from "@tabler/icons-react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SectionProgressOverview({
  activeInternPercent,
  logbookTodayPercent,
}: {
  activeInternPercent?: number
  logbookTodayPercent?: number
}) {
  const [activeIntern, setActiveIntern] = React.useState(0)
  const [logbookToday, setLogbookToday] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // If percentages are provided as props, use them
    if (activeInternPercent !== undefined && logbookTodayPercent !== undefined) {
      setActiveIntern(activeInternPercent)
      setLogbookToday(logbookTodayPercent)
      setLoading(false)
      return
    }

    const loadProgressData = async () => {
      try {
        if (!supabaseBrowser) return

        // Calculate active intern percentage
        const { count: totalMagang } = await supabaseBrowser
          .from("magang")
          .select("*", { count: "exact", head: true })

        const { count: aktifMagang } = await supabaseBrowser
          .from("magang")
          .select("*", { count: "exact", head: true })
          .eq("status", "Aktif")

        const activePercent = totalMagang && totalMagang > 0 
          ? Math.round((aktifMagang || 0) / totalMagang * 100)
          : 0

        // Calculate logbook today percentage
        const today = new Date().toISOString().split('T')[0]
        const { count: totalLogbookToday } = await supabaseBrowser
          .from("logbook")
          .select("*", { count: "exact", head: true })
          .eq("tanggal", today)

        const { count: approvedLogbookToday } = await supabaseBrowser
          .from("logbook")
          .select("*", { count: "exact", head: true })
          .eq("tanggal", today)
          .eq("status", "Disetujui")

        const logbookPercent = totalLogbookToday && totalLogbookToday > 0
          ? Math.round((approvedLogbookToday || 0) / totalLogbookToday * 100)
          : 0

        setActiveIntern(activePercent)
        setLogbookToday(logbookPercent)
      } catch (err) {
        console.error("Error loading progress data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProgressData()
  }, [activeInternPercent, logbookTodayPercent])

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))
  const a = clamp(activeIntern)
  const l = clamp(logbookToday)

  if (loading) {
    return (
      <Card className="rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <IconChartBar className="size-5 text-blue-600" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-blue-100/70 bg-white/70 shadow-md backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <IconChartBar className="size-5 text-blue-600" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Siswa Aktif Magang</span>
              <span className="font-semibold text-blue-900">{a}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-blue-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${a}%` }}
                aria-label="Siswa aktif magang"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Logbook Hari Ini</span>
              <span className="font-semibold text-blue-900">{l}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-blue-100">
              <div
                className="h-2 rounded-full bg-cyan-600"
                style={{ width: `${l}%` }}
                aria-label="Logbook hari ini"
              />
            </div>
          </div>
        </CardContent>
      </Card>
  )
}


