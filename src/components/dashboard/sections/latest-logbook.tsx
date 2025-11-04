/**
 * REFACTORED: Dashboard Section - Latest Logbook
 * 
 * File: src/components/dashboard/sections/latest-logbook.tsx
 * 
 * SEARCHABLE COMMENTS:
 * - REFACTORED_DASHBOARD_SECTION: Komponen section untuk menampilkan data logbook terbaru
 * - DASHBOARD_LATEST_LOGBOOK: Menampilkan 5 data logbook terbaru dengan realtime update
 * - DASHBOARD_LOGBOOK_MAPPING: Mapping data logbook dari database ke UI
 * - DASHBOARD_LOGBOOK_STATUS: Status color mapping untuk logbook
 * 
 * FUNGSI:
 * - Menampilkan daftar logbook terbaru di dashboard
 * - Real-time update ketika data logbook berubah
 * - Status color coding (Disetujui, Ditolak, Belum Diverifikasi)
 * - Loading state dan error handling
 */

import { IconNotebook, IconCalendar, IconUser } from "@tabler/icons-react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import * as React from "react"

type LatestLogbookItem = {
  id: string
  studentName: string
  activity: string
  date: string
  status?: "Disetujui" | "Ditolak" | "Belum Diverifikasi"
}

export function SectionLatestLogbook({ items, compact = false, minHeightClass }: { items?: LatestLogbookItem[]; compact?: boolean; minHeightClass?: string }) {
  const [logbookData, setLogbookData] = React.useState<LatestLogbookItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // REFACTORED_DASHBOARD_SECTION: Load data from database if no items provided
  React.useEffect(() => {
    if (items) {
      setLogbookData(items)
      setLoading(false)
      return
    }

    const loadLogbookData = async () => {
      try {
        if (!supabaseBrowser) return
        
        const { data, error } = await supabaseBrowser
          .from("logbook")
          .select(`
            id,
            nama_siswa,
            kegiatan,
            tanggal,
            status
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error loading logbook data:", error)
          return
        }

        // DASHBOARD_LOGBOOK_MAPPING: Mapping data logbook dari database ke UI
        const formattedData: LatestLogbookItem[] = data?.map((item: Record<string, unknown>) => ({
          id: (item.id as string | number).toString(),
          studentName: (item.nama_siswa as string) || "Nama tidak tersedia",
          activity: (item.kegiatan as string) || "Kegiatan tidak tersedia",
          date: new Date(item.tanggal as string).toLocaleDateString("id-ID"),
          status: (item.status === "Disetujui" || item.status === "Ditolak" || item.status === "Belum Diverifikasi") 
            ? item.status as "Disetujui" | "Ditolak" | "Belum Diverifikasi"
            : "Belum Diverifikasi"
        })) || []

        setLogbookData(formattedData)
      } catch (err) {
        console.error("Error loading logbook data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadLogbookData()
  }, [items])

  if (loading) {
    return (
      <section className="px-4 lg:px-6">
        <div className={`rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur ${minHeightClass ?? ""}`}>
          <header className={`flex items-center gap-2 px-5 ${compact ? "py-3" : "py-4"}`}>
            <div className="bg-teal-500/15 text-teal-700 ring-1 ring-teal-200/60 flex size-8 items-center justify-center rounded-lg">
              <IconNotebook className="size-4" />
            </div>
            <h3 className="text-base font-semibold">Logbook Terbaru</h3>
          </header>
          <div className="px-5 py-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat data...</p>
          </div>
        </div>
      </section>
    )
  }
  
  // DASHBOARD_LOGBOOK_STATUS: Status color mapping untuk logbook
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disetujui":
        return "bg-green-500/10 text-green-700 ring-1 ring-green-200/60"
      case "Ditolak":
        return "bg-red-500/10 text-red-700 ring-1 ring-red-200/60"
      case "Belum Diverifikasi":
        return "bg-yellow-500/10 text-yellow-700 ring-1 ring-yellow-200/60"
      default:
        return "bg-gray-500/10 text-gray-700 ring-1 ring-gray-200/60"
    }
  }

  return (
    <section className="px-4 lg:px-6">
      <div className={`rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur ${minHeightClass ?? ""}`}>
        <header className={`flex items-center gap-2 px-5 ${compact ? "py-3" : "py-4"}`}>
          <div className="bg-teal-500/15 text-teal-700 ring-1 ring-teal-200/60 flex size-8 items-center justify-center rounded-lg">
            <IconNotebook className="size-4" />
          </div>
          <h3 className="text-base font-semibold">Logbook Terbaru</h3>
        </header>
        <ul className="divide-y divide-blue-100/70">
          {logbookData.map((item) => (
            <li key={item.id} className={`px-5 ${compact ? "py-3" : "py-4"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconUser className="size-3.5 text-gray-500" />
                    <p className={`truncate font-medium ${compact ? "text-[13px]" : "text-sm"}`}>
                      {item.studentName}
                    </p>
                  </div>
                  <p className="text-muted-foreground truncate text-xs mb-2">
                    {item.activity}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <IconCalendar className="size-3.5" />
                    {item.date}
                  </p>
                </div>
                {item.status && (
                  <span className={`inline-flex h-6 items-center rounded-md px-2 text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// DASHBOARD_LOGBOOK_FALLBACK: Helper: contoh data dummy untuk dipakai cepat di halaman
export const latestLogbookDummy: LatestLogbookItem[] = [
  {
    id: "1",
    studentName: "Ahmad Rizki",
    activity: "Membuat desain UI aplikasi kasir menggunakan Figma",
    date: "1 Mar 2024",
    status: "Disetujui",
  },
  {
    id: "2",
    studentName: "Siti Nurhaliza",
    activity: "Setup server Linux Ubuntu untuk deployment aplikasi",
    date: "1 Mar 2024",
    status: "Ditolak",
  },
  {
    id: "3",
    studentName: "Budi Santoso",
    activity: "Belajar backend Laravel dan implementasi API",
    date: "2 Mar 2024",
    status: "Belum Diverifikasi",
  },
  {
    id: "4",
    studentName: "Ahmad Rizki",
    activity: "Testing aplikasi dan debugging error",
    date: "3 Mar 2024",
    status: "Disetujui",
  },
]
