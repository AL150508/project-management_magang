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
"use client"

import { IconSchool, IconChevronLeft, IconChevronRight, IconClock } from "@tabler/icons-react"
import { Calendar as IconCalendar } from "lucide-react"
import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Badge } from "@/components/ui/badge"

// Helper function untuk format tanggal
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

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
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 2 // Menampilkan 2 items per page agar lebih compact

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

        // DASHBOARD_LATEST_MAGANG: Ambil semua data magang untuk pagination
        // Catatan: kita coba sort by created_at; jika kolom tidak tersedia, fallback tanpa order
        let rows: Record<string, unknown>[] | null = null
        try {
          const { data, error } = await supabaseBrowser
            .from("magang")
            .select("*")
            .order("created_at", { ascending: false })
          if (error) throw error
          rows = data as Record<string, unknown>[] | null
        } catch {
          try {
            const { data, error } = await supabaseBrowser
              .from("magang")
              .select("*")
              .order("id", { ascending: false })
            if (error) throw error
            rows = data as Record<string, unknown>[] | null
          } catch {
            const { data, error } = await supabaseBrowser
              .from("magang")
              .select("*")
            if (error) throw error
            rows = data as Record<string, unknown>[] | null
          }
        }

        // DASHBOARD_MAGANG_MAPPING: Mapping data dari tabel magang dengan kolom yang benar
        const mapped: LatestMagangItem[] = (rows || []).map((r, idx) => {
          const studentName = (r["Siswa"] as string) || (r["id"] ? `Magang #${r["id"]}` : `Siswa ${idx + 1}`)
          const companyName = (r["nama_perusahaan"] as string) || (r["DUDI"] as string) || "-"
          const startDate = (r["periode_mulai"] as string) || (r["Mulai"] as string) || "-"
          const endDate = (r["periode_selesai"] as string) || (r["Selesai"] as string) || "-"
          const rawStatus = (r["status"] as string) || "Pending"
          const normalizedStatus: LatestMagangItem["status"] = rawStatus.toLowerCase() === "aktif"
            ? "Aktif"
            : rawStatus.toLowerCase() === "selesai"
            ? "Selesai"
            : "Tertunda"

          return {
            id: String(r["id"] ?? `${studentName}-${idx}`),
            studentName,
            companyName,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
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

  // Pagination logic
  const totalPages = Math.ceil(magangData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = magangData.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (loading) {
    return (
      <section className="px-2 sm:px-4 lg:px-6">
        <div className="rounded-xl border border-blue-100/60 bg-white shadow-sm backdrop-blur">
          <header className="flex items-center gap-2 px-4 py-3">
            <div className="bg-sky-500/15 text-sky-700 ring-1 ring-sky-200/60 flex size-7 items-center justify-center rounded-lg">
              <IconSchool className="size-3.5" />
            </div>
            <h3 className="text-sm font-semibold">Magang Terbaru</h3>
          </header>
          <div className="px-4 py-6 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-600">Memuat data...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-2 sm:px-4 lg:px-6">
      <div className="rounded-xl border border-blue-100/60 bg-white shadow-sm backdrop-blur">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500/15 text-sky-700 ring-1 ring-sky-200/60 flex size-7 items-center justify-center rounded-lg">
              <IconSchool className="size-3.5" />
            </div>
            <h3 className="text-sm font-semibold">Magang Terbaru</h3>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconChevronLeft className="size-4" />
              </button>
              <span className="text-xs text-slate-600 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconChevronRight className="size-4" />
              </button>
            </div>
          )}
        </header>
        
        {magangData.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            Belum ada data magang terbaru.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {currentItems.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs break-words">{item.studentName}</p>
                    <p className="text-muted-foreground text-xs break-words mt-0.5">{item.companyName}</p>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <IconCalendar className="size-3 flex-shrink-0" />
                      <span className="text-xs">{item.startDate} - {item.endDate}</span>
                    </p>
                  </div>
                  {item.status && (
                    <span className="bg-green-500/10 text-green-700 ring-1 ring-green-200/60 inline-flex h-5 items-center rounded px-1.5 text-xs font-medium flex-shrink-0 whitespace-nowrap">
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
