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
import { IconUser, IconEdit, IconTrash, IconPlus, IconSearch, IconEye } from "@tabler/icons-react"
import { toast } from "sonner"

export type LogbookItem = {
  id: string | number
  nama_siswa: string
  tanggal: string
  kegiatan: string
  kendala: string
  status: "Disetujui" | "Ditolak" | "Belum Diverifikasi"
  catatan_guru?: string
  catatan_dudi?: string
  foto?: string
  created_at?: string
  updated_at?: string
}

type LogbookTableProps = {
  onEdit: (item: LogbookItem) => void
  onView?: (item: LogbookItem) => void
  onAdd?: () => void
  refreshKey?: number
  studentNameFilter?: string // jika diisi, tampilkan hanya milik siswa ini
}

export function LogbookTable({ onEdit, onView, onAdd, refreshKey, studentNameFilter }: LogbookTableProps) {
  const [data, setData] = React.useState<LogbookItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [pageSize] = React.useState(5)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState("Semua")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      console.log("Loading Logbook data...")
      
      if (!supabaseBrowser) {
        console.warn("Supabase client not available, using empty data")
        setData([])
        setError(null)
        return
      }

      let query = supabaseBrowser.from("logbook").select("*").order("tanggal", { ascending: false })
      if (studentNameFilter) {
        query = query.eq("nama_siswa", studentNameFilter)
      }
      const { data: logbookData, error } = await query

      if (error) {
        console.error("Supabase error:", error.message || error)
        setError(`Database error: ${error.message || 'Unknown error'}`)
        setData([])
        return
      }

      console.log("Logbook data loaded successfully:", logbookData)
      
      const mapped: LogbookItem[] = (logbookData || []).map((row: Record<string, unknown>) => ({
        id: row.id as string | number,
        nama_siswa: (row.nama_siswa as string) || "",
        tanggal: (row.tanggal as string) || "",
        kegiatan: (row.kegiatan as string) || "",
        kendala: (row.kendala as string) || "",
        status: (row.status as "Disetujui" | "Ditolak" | "Belum Diverifikasi") || "Belum Diverifikasi",
        catatan_guru: (row.catatan_guru as string) || "",
        catatan_dudi: (row.catatan_dudi as string) || "",
        foto: (row.foto as string) || "",
        created_at: row.created_at as string,
        updated_at: row.updated_at as string
      }))

      setData(mapped)
      setError(null)
    } catch (err) {
      console.error("Error loading logbook data:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setData([])
    } finally {
      setLoading(false)
    }
  }, [studentNameFilter])

  React.useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  const handleDelete = async (id: string | number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data logbook ini?")) return

    try {
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }

      const { error } = await supabaseBrowser
        .from("logbook")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast.success("Data logbook berhasil dihapus")
      loadData()
    } catch (err) {
      console.error("Error deleting logbook:", err)
      toast.error("Gagal menghapus data logbook")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Disetujui":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui</Badge>
      case "Ditolak":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>
      case "Belum Diverifikasi":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Belum Diverifikasi</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Filter data
  const filteredData = data.filter(item => {
    const matchesSearch = item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.kegiatan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "Semua" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Logbook</CardTitle>
          <CardDescription>Memuat data logbook siswa...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Logbook</CardTitle>
          <CardDescription>Terjadi kesalahan saat memuat data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-lg backdrop-blur">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Data Logbook Siswa</CardTitle>
            <CardDescription>
              Kelola dan pantau logbook kegiatan magang siswa
            </CardDescription>
          </div>
          {onAdd && (
            <Button onClick={onAdd} className="w-full sm:w-auto">
              <IconPlus className="mr-2 h-4 w-4" />
              Tambah Logbook
            </Button>
          )}
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari nama siswa atau kegiatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Status</SelectItem>
              <SelectItem value="Disetujui">Disetujui</SelectItem>
              <SelectItem value="Ditolak">Ditolak</SelectItem>
              <SelectItem value="Belum Diverifikasi">Belum Diverifikasi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {/* Wrapper agar tabel bisa di-scroll horizontal pada layar kecil */}
        <div className="w-full min-w-0 rounded-md border overflow-x-auto">
          <Table className="min-w-[760px] md:min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Siswa & Tanggal</TableHead>
                <TableHead className="w-[320px]">Kegiatan & Kendala</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                {/* Sembunyikan kolom catatan di layar kecil untuk menjaga proporsi */}
                <TableHead className="w-[280px] hidden md:table-cell">Catatan</TableHead>
                <TableHead className="w-[100px] text-nowrap">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== "Semua" 
                      ? "Tidak ada data yang sesuai dengan filter" 
                      : "Belum ada data logbook"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-0">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <IconUser className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm break-words">{item.nama_siswa}</p>
                          <p className="text-xs text-gray-500 mt-1 break-words">{formatDate(item.tanggal)}</p>
                          {item.foto && (
                            <p className="text-xs text-blue-600 mt-1">Ada foto</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="min-w-0">
                      <div className="space-y-2 min-w-0">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-600">Kegiatan:</p>
                          <p className="text-sm text-gray-800 line-clamp-2 break-words">{item.kegiatan}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-600">Kendala:</p>
                          <p className="text-sm text-gray-800 line-clamp-2 break-words">{item.kendala}</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Guru:</p>
                          <p className="text-sm text-gray-800">
                            {item.catatan_guru || "Belum ada catatan"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">DUDI:</p>
                          <p className="text-sm text-gray-800">
                            {item.catatan_dudi || "Belum ada catatan"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(item)}
                            className="h-8 w-8 p-0"
                          >
                            <IconEye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <IconTrash className="h-4 w-4" />
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
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex-shrink-0"
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
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
