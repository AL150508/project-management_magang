"use client"

/**
 * REFACTORED: Dashboard Section - DUDI Aktif
 * 
 * File: src/components/dashboard/sections/dudi-aktif.tsx
 * 
 * SEARCHABLE COMMENTS:
 * - REFACTORED_DASHBOARD_SECTION: Komponen section untuk menampilkan DUDI aktif
 * - DASHBOARD_DUDI_AKTIF: Menampilkan daftar DUDI yang aktif dengan jumlah siswa
 * - DASHBOARD_DUDI_CARD: Card layout untuk informasi DUDI
 * - DASHBOARD_DUDI_INFO: Informasi detail DUDI (alamat, telepon, industri)
 * 
 * FUNGSI:
 * - Menampilkan daftar DUDI yang aktif
 * - Menampilkan jumlah siswa magang per DUDI
 * - Informasi kontak dan alamat DUDI
 * - Badge untuk jumlah siswa
 */

import { IconBuilding, IconMapPin, IconPhone, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"

export type DudiItem = {
  id: string | number
  name: string
  address?: string
  phone?: string
  industry?: string
  count?: number
}

export function SectionDudiAktif({ items }: { items?: DudiItem[] }) {
  const [data, setData] = React.useState<DudiItem[]>(items || [])
  const [_loading, setLoading] = React.useState(!items)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 2 // Menampilkan 2 data per halaman agar sejajar dengan Logbook Terbaru

  // Loader ketika items tidak diberikan
  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (items && items.length) {
          setData(items)
          return
        }
        if (!supabaseBrowser) return
        // Ambil daftar DUDI
        const { data: dudiRows, error: dErr } = await supabaseBrowser
          .from("dudi")
          .select("*")
          .order("created_at", { ascending: false })
        if (dErr) throw dErr
        // Ambil magang untuk hitung jumlah siswa per DUDI (abaikan Ditolak)
        const { data: magangRows } = await supabaseBrowser
          .from("magang")
          .select("DUDI,nama_dudi,nama_perusahaan,Status,status")
        type MagangRow = { DUDI?: string; nama_dudi?: string; nama_perusahaan?: string; Status?: string; status?: string }
        const countMap = ((magangRows as MagangRow[] | null) || []).reduce((acc: Record<string, number>, r: MagangRow) => {
          const st = (r.Status ?? r.status ?? "").toString()
          if (st === "Ditolak") return acc
          const nm = (r.DUDI ?? r.nama_dudi ?? r.nama_perusahaan ?? "").toString().trim().toLowerCase()
          if (!nm) return acc
          acc[nm] = (acc[nm] || 0) + 1
          return acc
        }, {})
        type DudiRow = { id: string | number; nama_perusahaan?: string; nama?: string; perusahaan?: string; alamat?: string; address?: string; telepon?: string; phone?: string; bidang_usaha?: string; industri?: string }
        const mapped: DudiItem[] = ((dudiRows as DudiRow[] | null) || []).map((r: DudiRow) => ({
          id: r.id,
          name: r.nama_perusahaan || r.nama || r.perusahaan || `DUDI #${r.id}`,
          address: r.alamat || r.address || undefined,
          phone: r.telepon || r.phone || undefined,
          industry: r.bidang_usaha || r.industri || undefined,
          count: countMap[((r.nama_perusahaan || r.nama || r.perusahaan || "").toString().trim().toLowerCase())] || 0,
        }))
        console.log("SectionDudiAktif: dudiRows=", (dudiRows||[]).length, "mapped=", mapped.length)
        if (mounted) {
          setData(mapped)
          // Reset halaman agar tidak berada di page yang tidak valid setelah data berubah
          setCurrentPage(1)
        }
      } catch (e) {
        console.warn("SectionDudiAktif load error", e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    // Realtime refresh saat dudi/magang berubah
    const ch1 = supabaseBrowser?.channel("realtime-dudi-aktif")
      .on("postgres_changes", { event: "*", schema: "public", table: "magang" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "dudi" }, () => load())
      .subscribe()
    return () => {
      mounted = false
      if (ch1) supabaseBrowser?.removeChannel(ch1)
    }
  }, [items])

  // Pagination logic (clamp halaman jika melewati totalPages)
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage))
  const safePage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safePage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = data.slice(startIndex, endIndex)

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  return (
    <section className="px-2 sm:px-4 lg:px-6">
      <div className="rounded-xl border border-blue-100/60 bg-white shadow-sm backdrop-blur">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/15 text-blue-700 ring-1 ring-blue-200/60 flex size-7 items-center justify-center rounded-lg">
              <IconBuilding className="size-3.5" />
            </div>
            <h3 className="text-sm font-semibold">DUDI Aktif</h3>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <IconChevronLeft className="size-3.5" />
              </button>
              <span className="text-xs text-slate-600 font-medium min-w-[2rem] text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <IconChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </header>
        
        <div className="p-3">
          {data.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">Belum ada DUDI aktif.</div>
          ) : (
          <div className="space-y-2">
            {currentItems.map((dudi) => (
                        <div key={dudi.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-xs text-slate-900 break-words leading-tight">{dudi.name}</h4>
                    {dudi.industry && (
                      <p className="text-xs text-slate-600 mt-0.5 break-words">{dudi.industry}</p>
                    )}
                    <div className="flex flex-col gap-0.5 mt-1.5 text-xs text-slate-500">
                      {dudi.address && (
                        <div className="flex items-start gap-1 min-w-0">
                          <IconMapPin className="size-3 flex-shrink-0 mt-0.5" />
                          <span className="break-words min-w-0 text-xs leading-tight">{dudi.address}</span>
                        </div>
                      )}
                      {dudi.phone && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <IconPhone className="size-3" />
                          <span className="text-xs">{dudi.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="bg-blue-500/10 text-blue-700 ring-1 ring-blue-200/60 inline-flex h-4 items-center rounded px-1.5 text-xs font-medium flex-shrink-0 whitespace-nowrap">
                    {(typeof dudi.count === 'number' ? dudi.count : 0)} siswa
                  </span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  )
}
