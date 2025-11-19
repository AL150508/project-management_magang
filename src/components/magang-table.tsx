"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconUser, IconEdit, IconTrash, IconPlus, IconSearch, IconDownload, IconStar } from "@tabler/icons-react"
import { showConfirmation, showSuccess, showError, showInfo } from "@/lib & database connection/utils"

export type MagangItem = {
  id: string | number
  nama_siswa: string
  nis?: string
  kelas?: string
  jurusan?: string
  nama_dudi?: string
  periode_mulai?: string
  periode_selesai?: string
  status?: "Aktif" | "Selesai" | "Pending"
  nilai?: number
  created_at?: string
  updated_at?: string
}

type MagangTableProps = {
  onEdit: (item: MagangItem) => void
  onAdd?: () => void
  onNilai?: (item: MagangItem) => void
  refreshKey?: number
}

export function MagangTable({ onEdit, onAdd, onNilai, refreshKey }: MagangTableProps) {
  const [data, setData] = React.useState<MagangItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [pageSize, setPageSize] = React.useState(5)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState("Semua")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      console.log("Loading Magang data...")
      
      // Check if Supabase is properly configured
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }

      type MagangRowDB = {
        Siswa?: string
        NIS?: string
        Kelas?: string
        Jurusan?: string
        DUDI?: string
        nama_dudi?: string
        nama_perusahaan?: string
        Mulai?: string
        Selesai?: string
        Status?: string
        nilai?: number
      }
      let magangData: MagangRowDB[] | null = null
      try {
        const { data, error } = await supabaseBrowser!
          .from("magang")
          .select("id,Siswa,nama_siswa,nis,kelas,jurusan,nama_dudi,periode_mulai,periode_selesai,status,nilai,created_at")
          .order("created_at", { ascending: false })
        if (error) throw error
        magangData = (data as unknown as MagangRowDB[]) || null
      } catch {
        // Fallback jika kolom created_at tidak ada
        const { data, error } = await supabaseBrowser!
          .from("magang")
          .select("*")
        if (error) {
          console.error("Supabase error:", error.message || error)
          throw new Error(`Database error: ${error.message || 'Unknown error'}`)
        }
        magangData = (data as unknown as MagangRowDB[]) || null
      }

      console.log("Magang data loaded successfully:", magangData)
      
      // Map data dari struktur tabel `magang` ke struktur MagangItem
      type MagangRow = {
        Siswa?: string
        NIS?: string
        Kelas?: string
        Jurusan?: string
        DUDI?: string
        nama_dudi?: string
        nama_perusahaan?: string
        Mulai?: string
        Selesai?: string
        Status?: string
        nilai?: number
      }
      const mapped: MagangItem[] = (magangData as MagangRow[] | null || []).map((row) => {
        const rawStatus = typeof row["status"] === "string" ? row["status"] : undefined
        const normalizedStatus =
          rawStatus === "Aktif" || rawStatus === "Selesai" || rawStatus === "Pending"
            ? rawStatus
            : "Pending"

        return {
          id: row["id"] || row["Siswa"] || "",
          nama_siswa: row["nama_siswa"] ?? row["Siswa"] ?? "-",
          kelas: row["kelas"] ?? row["Kelas"] ?? "",
          jurusan: row["jurusan"] ?? row["Jurusan"] ?? "",
          nama_dudi: row["nama_perusahaan"] ?? row["nama_dudi"] ?? row["DUDI"] ?? "",
          periode_mulai: row["periode_mulai"] ?? row["Mulai"] ?? undefined,
          periode_selesai: row["periode_selesai"] ?? row["Selesai"] ?? undefined,
          status: normalizedStatus,
          nilai: typeof row.nilai === "number" ? row.nilai : undefined,
        }
      })

      console.log("Mapped data sample:", mapped.slice(0, 3))
      setData(mapped)
      
      setError(null) // Clear any previous errors
      
    } catch (error) {
      console.error("Error loading Magang data:", error)
      
      // Better error message for user
      let errorMessage = "Gagal memuat data Magang"
      if (error instanceof Error) {
        if (error.message.includes("Database error")) {
          errorMessage = "Gagal terhubung ke database"
        } else if (error.message.includes("Supabase client")) {
          errorMessage = "Konfigurasi database tidak lengkap"
        }
      }

      const details = error instanceof Error ? error.message : String(error)
      const composed = `${errorMessage} (${details})`
      
      setError(composed)
      showError(errorMessage, details)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Force reload when parent changes refreshKey
  React.useEffect(() => {
    if (refreshKey === undefined) return
    loadData()
  }, [refreshKey, loadData])

  // Realtime: otomatis reload ketika ada perubahan di tabel `magang`
  React.useEffect(() => {
    if (!supabaseBrowser) return
    const channel = supabaseBrowser!
      .channel("realtime-magang")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "magang" },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabaseBrowser!.removeChannel(channel)
    }
  }, [loadData])

  const filteredData = React.useMemo(() => {
    let filtered = data

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama_siswa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kelas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jurusan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama_dudi?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "Semua") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    return filtered
  }, [data, searchTerm, statusFilter])

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  const handleDelete = async (id: string | number) => {
    showConfirmation({
      message: "Apakah Anda yakin ingin menghapus data magang ini?",
      confirmLabel: "Hapus",
      onConfirm: async () => {
        try {
          if (!supabaseBrowser) {
            showError("Konfigurasi database tidak lengkap")
            return
          }
          
          const { error } = await supabaseBrowser
            .from("magang")
            .delete()
            .eq("Siswa", id)
          
          if (error) {
            throw error
          }
          
          showSuccess("Data magang berhasil dihapus")
          loadData()
        } catch (error) {
          console.error("Error deleting Magang:", error)
          
          let errorMessage = "Gagal menghapus data magang"
          if (error && typeof error === 'object' && 'message' in error) {
            if (typeof error.message === 'string') {
              errorMessage = error.message
            }
          }
          const details = error instanceof Error ? error.message : String(error)
          showError(errorMessage, details)
        }
      }
    })
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Aktif":
        return (
          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
            Aktif
          </Badge>
        )
      case "Selesai":
        return (
          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
            Selesai
          </Badge>
        )
      case "Pending":
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">
            -
          </Badge>
        )
    }
  }

  const getNilaiBadge = (nilai?: number) => {
    if (!nilai) return <span className="text-gray-500">-</span>
    
    if (nilai >= 85) {
      return <Badge className="bg-green-100 text-green-800">A</Badge>
    } else if (nilai >= 75) {
      return <Badge className="bg-blue-100 text-blue-800">B</Badge>
    } else if (nilai >= 65) {
      return <Badge className="bg-yellow-100 text-yellow-800">C</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">D</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="size-5 text-blue-600" />
            Daftar Siswa Magang
          </CardTitle>
          <CardDescription>Memuat data siswa magang...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-blue-100/30 animate-pulse" />
            <div className="h-16 rounded-xl bg-blue-100/30 animate-pulse" />
            <div className="h-16 rounded-xl bg-blue-100/30 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl border border-red-200/60 bg-red-50/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-red-800">Gagal memuat data</CardTitle>
          <CardDescription className="text-red-700">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadData} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-lg backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="size-5 text-blue-600" />
              Daftar Siswa Magang
            </CardTitle>
            <CardDescription>Kelola data siswa yang sedang melaksanakan magang di industri</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onAdd}>
              <IconPlus className="size-4 mr-2 text-white" />
              <span className="text-white">Siswa</span>
            </Button>
            <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <IconDownload className="size-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 min-w-0">
          <div className="relative flex-1 min-w-0">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <Input
              placeholder="Cari siswa, NIS, kelas, jurusan, DUDI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full min-w-0"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-20 sm:w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-blue-100/50 overflow-x-auto min-w-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/50">
                <TableHead className="font-semibold text-blue-900">Siswa</TableHead>
                <TableHead className="font-semibold text-blue-900">Kelas & Jurusan</TableHead>
                <TableHead className="font-semibold text-blue-900">DUDI</TableHead>
                <TableHead className="font-semibold text-blue-900">Periode</TableHead>
                <TableHead className="font-semibold text-blue-900">Status</TableHead>
                <TableHead className="font-semibold text-blue-900">Nilai</TableHead>
                <TableHead className="font-semibold text-blue-900">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== "Semua" 
                      ? "Tidak ada data yang sesuai dengan filter" 
                      : "Belum ada data siswa magang"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/30">
                    <TableCell className="min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 flex size-8 items-center justify-center rounded-lg flex-shrink-0">
                          <IconUser className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900 break-words">{item.nama_siswa}</div>
                          {item.nis && (
                            <div className="text-sm text-slate-500 break-words">NIS: {item.nis}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 break-words">{item.kelas || "-"}</div>
                        <div className="text-sm text-slate-500 break-words">{item.jurusan || "-"}</div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="font-medium text-slate-900 break-words">{item.nama_dudi || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-slate-900">{item.periode_mulai || "-"}</div>
                        <div className="text-slate-500">{item.periode_selesai || "-"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell>
                      {getNilaiBadge(item.nilai)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        >
                          <IconEdit className="size-4" />
                        </Button>
                        {/* Verifikasi */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              if (!supabaseBrowser) return
                              const next = item.status === "Aktif" ? "Pending" : "Aktif"
                              // Kembalikan perilaku lama: gunakan id bila tersedia
                              let { error } = await supabaseBrowser
                                .from("magang")
                                .update({ status: next })
                                .eq("id", item.id)
                              if (error) {
                                // Fallback ke kolom Siswa jika struktur lama dipakai
                                await supabaseBrowser
                                  .from("magang")
                                  .update({ status: next })
                                  .eq("Siswa", item.id)
                                error = null
                              }
                              if (!error) {
                                showSuccess(`Status diperbarui menjadi ${next}`)
                                loadData()
                              }
                            } catch {}
                          }}
                          className="h-8 px-2 text-xs"
                          title="Verifikasi"
                        >
                          Verifikasi
                        </Button>
                        {onNilai && item.status === "Selesai" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onNilai(item)}
                            className="h-8 w-8 p-0 text-yellow-600 hover:bg-yellow-50"
                            title="Berikan Nilai"
                          >
                            <IconStar className="size-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-4 sm:px-0">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex-shrink-0"
              >
                Sebelumnya
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-600 whitespace-nowrap">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex-shrink-0"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
