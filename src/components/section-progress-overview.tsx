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
      <section className="px-2 sm:px-4 lg:px-6">
        <div className="rounded-xl border border-blue-100/60 bg-white shadow-sm backdrop-blur">
          <header className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <div className="bg-blue-500/15 text-blue-700 ring-1 ring-blue-200/60 flex size-7 items-center justify-center rounded-lg">
              <IconChartBar className="size-3.5" />
            </div>
            <h3 className="text-sm font-semibold">Progress Overview</h3>
          </header>
          
          <div className="p-3">
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-600">Memuat data...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-2 sm:px-4 lg:px-6">
      <div className="rounded-xl border border-blue-100/60 bg-white shadow-sm backdrop-blur">
        <header className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <div className="bg-blue-500/15 text-blue-700 ring-1 ring-blue-200/60 flex size-7 items-center justify-center rounded-lg">
            <IconChartBar className="size-3.5" />
          </div>
          <h3 className="text-sm font-semibold">Progress Overview</h3>
        </header>
        
        <div className="p-3">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
                <span>Siswa Aktif Magang</span>
                <span className="font-semibold text-blue-900">{a}%</span>
              </div>
              <div className="h-2 rounded-full bg-blue-100">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${a}%` }}
                  aria-label="Siswa aktif magang"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
                <span>Logbook Hari Ini</span>
                <span className="font-semibold text-blue-900">{l}%</span>
              </div>
              <div className="h-2 rounded-full bg-blue-100">
                <div
                  className="h-2 rounded-full bg-cyan-600 transition-all duration-300"
                  style={{ width: `${l}%` }}
                  aria-label="Logbook hari ini"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


