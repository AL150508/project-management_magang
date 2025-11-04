"use client"

// Komponen Tabel Magang untuk guru
// Tujuan:
// - Menampilkan daftar siswa magang beserta detailnya
// - Pencarian (multi kolom), filter status, dan pagination
// - Aksi CRUD ringan: verifikasi status, edit, hapus, dan beri nilai
// - Sinkron realtime dengan Supabase (otomatis refresh saat data berubah)
// Catatan: Semua komentar ini hanya menjelaskan alur, tidak mengubah logika maupun struktur kode.

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser" // Klien Supabase sisi browser untuk fetch/update data
import { Badge } from "@/components/ui/badge" // Lencana status/nilai
import { Button } from "@/components/ui/button" // Tombol aksi
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Kartu UI pembungkus
import { Input } from "@/components/ui/input" // Input pencarian
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
import { IconUser, IconEdit, IconTrash, IconPlus, IconSearch, IconDownload, IconStar } from "@tabler/icons-react" // Ikon
import { toast } from "sonner" // Notifikasi ringan

// Bentuk data baris yang dipakai di tabel (hasil mapping dari tabel "magang")
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
  pkColumn?: "id" | "Siswa"
}

// Properti yang diperlukan oleh komponen tabel
type MagangTableProps = {
  onEdit: (item: MagangItem) => void
  onAdd?: () => void
  onNilai?: (item: MagangItem) => void
  refreshKey?: number
}

export function MagangTable({ onEdit, onAdd, onNilai, refreshKey }: MagangTableProps) {
  // State utama: data tabel, loading/error, filter/pencarian, dan pagination
  const [data, setData] = React.useState<MagangItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [pageSize, setPageSize] = React.useState(5)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState("Semua")

  // Memuat data dari Supabase dan melakukan normalisasi bentuk data
  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }

      let magangDataRes: MagangRow[] | null = null
      try {
        const { data, error } = await supabaseBrowser!
          .from("magang")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw new Error(error.message || "Unknown error")
        magangDataRes = data as MagangRow[] | null
      } catch {
        // Fallback tanpa order jika kolom created_at tidak ada
        const { data, error } = await supabaseBrowser!
          .from("magang")
          .select("*")
        if (error) throw new Error(error.message || "Unknown error")
        magangDataRes = data as MagangRow[] | null
      }

      // Tipe data mentah dari tabel "magang" (kemungkinan variasi nama kolom)
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
        id?: string | number
      }
      // Mapping baris mentah menjadi bentuk seragam `MagangItem`
      // - Normalisasi status ke tiga nilai: "Aktif" | "Selesai" | "Pending"
      // - Tentukan primary key yang tersedia: gunakan `id` jika ada, fallback ke kolom "Siswa"
      // - Satukan kemungkinan variasi kolom DUDI (DUDI/nama_dudi/nama_perusahaan)
      const mapped: MagangItem[] = (magangDataRes as MagangRow[] | null || []).map((row) => {
        const rawStatus = typeof row["Status"] === "string" ? row["Status"] : undefined
        const normalizedStatus =
          rawStatus === "Aktif" || rawStatus === "Selesai" || rawStatus === "Pending"
            ? rawStatus
            : "Pending"

        const hasId = typeof row.id !== "undefined" && row.id !== null
        const resolvedId = hasId ? row.id! : row["Siswa"] || ""
        const pkColumn: "id" | "Siswa" = hasId ? "id" : "Siswa"

        return {
          id: resolvedId,
          pkColumn,
          nama_siswa: row["Siswa"] ?? "",
          kelas: row["Kelas"] ?? "",
          jurusan: row["Jurusan"] ?? "",
          nama_dudi: row["DUDI"] ?? row["nama_dudi"] ?? row["nama_perusahaan"] ?? "",
          periode_mulai: row["Mulai"] ?? undefined,
          periode_selesai: row["Selesai"] ?? undefined,
          status: normalizedStatus,
          nilai: typeof row.nilai === "number" ? row.nilai : undefined,
        }
      })

      setData(mapped)
      setError(null)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      setError(`Gagal memuat data Magang (${msg})`)
      toast.error(`Gagal memuat data Magang (${msg})`)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load awal saat komponen mount
  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Reload saat `refreshKey` berubah (dipicu dari luar)
  React.useEffect(() => {
    if (refreshKey === undefined) return
    loadData()
  }, [refreshKey, loadData])

  // Berlangganan realtime perubahan tabel "magang" agar tabel otomatis segar
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

  // Filter data berdasarkan kata kunci dan status
  const filteredData = React.useMemo(() => {
    let filtered = data
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama_siswa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kelas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jurusan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama_dudi?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== "Semua") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }
    return filtered
  }, [data, searchTerm, statusFilter])

  // Potong data sesuai halaman yang aktif
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  // Hapus data baris tertentu berdasarkan kolom primary key yang tersedia
  const handleDelete = async (id: string | number, pkColumn?: "id" | "Siswa") => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return
    try {
      if (!supabaseBrowser) {
        toast.error("Konfigurasi database tidak lengkap")
        return
      }
      const targetColumn = pkColumn || "Siswa"
      const { error } = await supabaseBrowser!
        .from("magang")
        .delete()
        .eq(targetColumn, id)

      if (error) {
        throw new Error(`Delete error: ${error.message}`)
      }
      toast.success("Data Magang berhasil dihapus")
      loadData()
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error)
      toast.error(`Gagal menghapus data (${details})`)
    }
  }

  // Render badge status dengan warna berbeda
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

  // Konversi nilai angka ke grade huruf (A-D)
  // Batas nilai:
  // - >= 85: A
  // - >= 75: B
  // - >= 65: C
  // - < 65 : D
  const getNilaiBadge = (nilai?: number) => {
    if (!nilai) return <span className="text-gray-500">-</span>
    if (nilai >= 85) return <Badge className="bg-green-100 text-green-800">A</Badge>
    if (nilai >= 75) return <Badge className="bg-blue-100 text-blue-800">B</Badge>
    if (nilai >= 65) return <Badge className="bg-yellow-100 text-yellow-800">C</Badge>
    return <Badge className="bg-red-100 text-red-800">D</Badge>
  }

  // Tampilan loading saat data sedang dimuat
  if (loading) {
    return (
      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
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

  // Tampilan error dan tombol coba lagi
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

  // Tampilan utama tabel dengan header aksi, filter, tabel, dan pagination
  return (
    <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
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
            {/* Tambah data magang baru */}
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
              <IconPlus className="size-4 mr-2" />
              Tambah Siswa
            </Button>
            {/* Ekspor/print tampilan saat ini ke jendela baru (bisa dicetak ke PDF melalui dialog print browser) */}
            <Button
              size="sm"
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => {
                try {
                  const printableRows = filteredData.map((r) => ({
                    Siswa: r.nama_siswa,
                    NIS: r.nis || "-",
                    Kelas: r.kelas || "-",
                    Jurusan: r.jurusan || "-",
                    DUDI: r.nama_dudi || "-",
                    Mulai: r.periode_mulai || "-",
                    Selesai: r.periode_selesai || "-",
                    Status: r.status || "-",
                    Nilai: typeof r.nilai === "number" ? r.nilai : "-",
                  }))

                  // Buat header tabel dari kunci objek baris printable
                  const tableHead = Object.keys(printableRows[0] || {
                    Siswa: "",
                    NIS: "",
                    Kelas: "",
                    Jurusan: "",
                    DUDI: "",
                    Mulai: "",
                    Selesai: "",
                    Status: "",
                    Nilai: "",
                  })
                    .map((h) => `<th style=\"padding:8px;border:1px solid #e5e7eb;text-align:left;\">${h}</th>`) 
                    .join("")

                  // Buat body tabel dari nilai objek baris printable
                  const tableBody = printableRows
                    .map((row) =>
                      `<tr>` +
                      Object.values(row)
                        .map((v) => `<td style=\"padding:8px;border:1px solid #e5e7eb;\">${String(v)}</td>`) 
                        .join("") +
                      `</tr>`
                    )
                    .join("")

                  const html = `<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <title>Daftar Siswa Magang</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; color: #0f172a; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    thead { background: #f0f9ff; }
  </style>
</head>
<body>
  <h1>Daftar Siswa Magang</h1>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
  <script>window.print();</script>
</body>
</html>`

                  const w = window.open("", "_blank")
                  if (!w) return
                  w.document.open()
                  w.document.write(html)
                  w.document.close()
                } catch {}
              }}
            >
              <IconDownload className="size-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            {/* Input pencarian multi-kolom */}
            <Input
              placeholder="Cari siswa, NIS, kelas, jurusan, DUDI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {/* Filter status */}
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
            {/* Ubah jumlah baris per halaman */}
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-24">
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

        <div className="rounded-lg border border-blue-100/50 overflow-hidden">
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
                // Render baris data
                paginatedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 flex size-8 items-center justify-center rounded-lg">
                          <IconUser className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{item.nama_siswa}</div>
                          {item.nis && (
                            <div className="text-sm text-slate-500">NIS: {item.nis}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{item.kelas || "-"}</div>
                        <div className="text-sm text-slate-500">{item.jurusan || "-"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{item.nama_dudi || "-"}</div>
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
                        {/* Edit data */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        >
                          <IconEdit className="size-4" />
                        </Button>
                        {/* Toggle verifikasi/aktif: jika "Aktif" maka ubah ke "Pending", sebaliknya ke "Aktif" */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              if (!supabaseBrowser) return
                              const next = item.status === "Aktif" ? "Pending" : "Aktif"
                              const targetColumn = item.pkColumn || "Siswa"
                              const { error } = await supabaseBrowser
                                .from("magang")
                                .update({ status: next })
                                .eq(targetColumn, item.id)
                              if (!error) {
                                toast.success(`Status diperbarui menjadi ${next}`)
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
                          // Beri nilai hanya jika status selesai
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
                        {/* Hapus data */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id, item.pkColumn)}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length} data
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <span className="flex items-center px-3 text-sm">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
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


