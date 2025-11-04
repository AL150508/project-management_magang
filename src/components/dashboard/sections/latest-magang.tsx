/**
 * REFACTORED: Dashboard Section - Latest Magang
 * 
 * File: src/components/dashboard/sections/latest-magang.tsx
 * 
 * SEARCHABLE COMMENTS:
 * - REFACTORED_DASHBOARD_SECTION: Komponen section untuk menampilkan data magang terbaru
 * - DASHBOARD_LATEST_MAGANG: Menampilkan 5 data magang terbaru dengan realtime update
 * - DASHBOARD_MAGANG_MAPPING: Mapping fleksibel untuk berbagai nama kolom database
 * - DASHBOARD_MAGANG_FALLBACK: Fallback data dummy jika database error
 * 
 * FUNGSI:
 * - Menampilkan daftar magang terbaru di dashboard
 * - Real-time update ketika data magang berubah
 * - Mapping fleksibel untuk kompatibilitas berbagai struktur database
 * - Loading state dan error handling
 */

import { IconCalendar, IconSchool } from "@tabler/icons-react"
import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"

type LatestMagangItem = {
  id: string
  studentName: string
  companyName: string
  startDate: string
  endDate: string
  status?: "Aktif" | "Selesai" | "Tertunda"
}

export function SectionLatestMagang({ items, compact = false, minHeightClass }: { items?: LatestMagangItem[]; compact?: boolean; minHeightClass?: string }) {
  const [magangData, setMagangData] = React.useState<LatestMagangItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // REFACTORED_DASHBOARD_SECTION: Load data from database if no items provided
  React.useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const provided = Array.isArray(items) ? items : null
        if (provided && provided.length > 0) {
          // Jika komponen dipanggil dengan props `items`, gunakan langsung
          setMagangData(provided)
          return
        }

        if (!supabaseBrowser) {
          // DASHBOARD_MAGANG_FALLBACK: jika client DB belum siap, tampilkan dummy
          setMagangData(latestMagangDummy)
          return
        }

        // DASHBOARD_LATEST_MAGANG: Ambil 5 data magang terbaru
        // Catatan: kita coba sort by created_at; jika kolom tidak tersedia, fallback tanpa order
        let rows: Record<string, unknown>[] | null = null
        try {
          const { data, error } = await supabaseBrowser
            .from("magang")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5)
          if (error) throw error
          rows = data as Record<string, unknown>[] | null
        } catch {
          try {
            const { data, error } = await supabaseBrowser
              .from("magang")
              .select("*")
              .order("id", { ascending: false })
              .limit(5)
            if (error) throw error
            rows = data as Record<string, unknown>[] | null
          } catch {
            const { data, error } = await supabaseBrowser
              .from("magang")
              .select("*")
              .limit(5)
            if (error) throw error
            rows = data as Record<string, unknown>[] | null
          }
        }

        // DASHBOARD_MAGANG_MAPPING: Mapping fleksibel: sesuaikan berbagai kemungkinan nama kolom
        const mapped: LatestMagangItem[] = (rows || []).map((r, idx) => {
          const studentName = (r["Siswa"] as string) || (r["nama_siswa"] as string) || (r["siswa"] as string) || `Siswa ${idx + 1}`
          const companyName = (r["DUDI"] as string) || (r["nama_dudi"] as string) || (r["nama_perusahaan"] as string) || "-"
          const startDate = (r["Mulai"] as string) || (r["periode_mulai"] as string) || "-"
          const endDate = (r["Selesai"] as string) || (r["periode_selesai"] as string) || "-"
          const rawStatus = (r["Status"] as string) || (r["status"] as string) || "Pending"
          const normalizedStatus: LatestMagangItem["status"] = rawStatus.toLowerCase() === "aktif"
            ? "Aktif"
            : rawStatus.toLowerCase() === "selesai"
            ? "Selesai"
            : "Tertunda"

          return {
            id: String(r["id"] ?? r["Siswa"] ?? `${studentName}-${idx}`),
            studentName,
            companyName,
            startDate,
            endDate,
            status: normalizedStatus,
          }
        })

        if (!isMounted) return
        setMagangData(mapped)
      } catch (e) {
        // DASHBOARD_MAGANG_FALLBACK: Jika terjadi error, jangan patahkan UI: tampilkan dummy sebagai fallback
        console.error("SectionLatestMagang load error:", e)
        if (!isMounted) return
        setMagangData(latestMagangDummy)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    // DASHBOARD_LATEST_MAGANG: Realtime: refresh otomatis ketika tabel `magang` berubah
    const channel = supabaseBrowser?.channel("realtime-latest-magang").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "magang" },
      () => load()
    ).subscribe()

    return () => {
      isMounted = false
      if (channel) supabaseBrowser?.removeChannel(channel)
    }
  }, [items])

  if (loading) {
    return (
      <section className="px-4 lg:px-6">
        <div className={`rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur ${minHeightClass ?? ""}`}>
          <header className={`flex items-center gap-2 px-5 ${compact ? "py-3" : "py-4"}`}>
            <div className="bg-sky-500/15 text-sky-700 ring-1 ring-sky-200/60 flex size-8 items-center justify-center rounded-lg">
              <IconSchool className="size-4" />
            </div>
            <h3 className="text-base font-semibold">Magang Terbaru</h3>
          </header>
          <div className="px-5 py-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat data...</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="px-4 lg:px-6">
      <div className={`rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur ${minHeightClass ?? ""}`}>
        <header className={`flex items-center gap-2 px-5 ${compact ? "py-3" : "py-4"}`}>
          <div className="bg-sky-500/15 text-sky-700 ring-1 ring-sky-200/60 flex size-8 items-center justify-center rounded-lg">
            <IconSchool className="size-4" />
          </div>
          <h3 className="text-base font-semibold">Magang Terbaru</h3>
        </header>
        {magangData.length === 0 ? (
          <div className={`px-5 ${compact ? "py-6" : "py-10"} text-center text-sm text-muted-foreground`}>
            Belum ada data magang terbaru.
          </div>
        ) : (
          <ul className="divide-y divide-blue-100/70">
            {magangData.map((item) => (
              <li key={item.id} className={`px-5 ${compact ? "py-3" : "py-4"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className={`truncate font-medium ${compact ? "text-[13px]" : "text-sm"}`}>{item.studentName}</p>
                    <p className="text-muted-foreground truncate text-xs">{item.companyName}</p>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <IconCalendar className="size-3.5" />
                      {item.startDate} - {item.endDate}
                    </p>
                  </div>
                  {item.status && (
                    <span className="bg-green-500/10 text-green-700 ring-1 ring-green-200/60 inline-flex h-6 items-center rounded-md px-2 text-xs font-medium">
                      {item.status}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// DASHBOARD_MAGANG_FALLBACK: Helper: contoh data dummy untuk dipakai cepat di halaman
export const latestMagangDummy: LatestMagangItem[] = [
  {
    id: "1",
    studentName: "Ahmad Rizki",
    companyName: "PT. Teknologi Nusantara",
    startDate: "15/1/2024",
    endDate: "15/4/2024",
    status: "Aktif",
  },

  {
    id: "2",
    studentName: "Siti Nurhaliza",
    companyName: "CV. Digital Kreativa",
    startDate: "20/02/2024",
    endDate: "20/04/2024",
    status: "Aktif",
  },
  
  {
    id: "3",
    studentName: "Budi Santoso",
    companyName: "PT. Inovasi Mandiri",
    startDate: "01/03/2024",
    endDate: "01/06/2024",
    status: "Selesai",
  },

  {
    id: "4",
    studentName: "japip hiro",
    companyName: "PT. Mandiri",
    startDate: "01/03/2025",
    endDate: "01/06/2025",
    status: "Selesai",
  },
]
