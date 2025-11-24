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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { IconUser, IconEdit, IconTrash, IconPlus, IconSearch, IconEye } from "@tabler/icons-react"
import { toast } from "sonner"
import { MediaPreview } from "./logbook/media-preview"

// Helper function for media type detection
function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

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
  user_id?: string // UUID user yang membuat logbook
  created_at?: string
  updated_at?: string
}

type LogbookTableProps = {
  onEdit: (item: LogbookItem) => void
  onView?: (item: LogbookItem) => void
  onAdd?: () => void
  refreshKey?: number
  studentUserId?: string // filter by user_id (lebih akurat)
  studentNameFilter?: string // fallback filter by nama (untuk backward compatibility)
}

export function LogbookTable({ onEdit, onView, onAdd, refreshKey, studentUserId, studentNameFilter }: LogbookTableProps) {
  const [data, setData] = React.useState<LogbookItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [pageSize] = React.useState(5)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState("Semua")
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const loadData = React.useCallback(async () => {
    // Clear previous timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }

    setLoading(true)
    setError(null)
    
    // Set timeout protection - max 15 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      console.error("⏱️ Loading timeout - forcing error state")
      setLoading(false)
      setError("Waktu tunggu habis. Silakan coba lagi atau periksa koneksi internet.")
      toast.error("Gagal memuat data: timeout")
    }, 15000)

    try {
      console.log("🔄 Loading Logbook data...")
      
      if (!supabaseBrowser) {
        console.warn("⚠️ Supabase client not available, using empty data")
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
        setData([])
        setError(null)
        return
      }

      // 1. Ambil data dari tabel logbook tanpa join
      const { data: logbookData, error } = await supabaseBrowser
        .from("logbook")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error loading logbook data:", error)
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
        setError(`Database error: ${error.message || 'Unknown error'}`)
        setData([])
        return
      }

      if (!logbookData || logbookData.length === 0) {
        console.log("✅ No logbook data found")
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
        setData([])
        setLoading(false)
        return
      }

      const formattedData = logbookData.map(log => ({
        id: log.id,
        nama_siswa: log.nama_siswa || log.Siswa || 'Unknown',
        tanggal: log.tanggal || log.created_at,
        kegiatan: log.kegiatan || '-',
        kendala: log.kendala || '-',
        status: log.status || 'menunggu',
        foto: log.foto || null,
        catatan_guru: log.catatan_guru || null,
        catatan_dudi: log.catatan_dudi || null,
        user_id: log.user_id || null
      }))

      const totalFetched = formattedData.length
      console.log("Logbook fetched:", { totalFetched, studentNameFilter })

      let filteredData = formattedData
      
      // Priority 1: Filter by user_id if available (most accurate)
      if (studentUserId && typeof studentUserId === 'string') {
        console.log('[Logbook Filter] Filtering by user_id:', studentUserId)
        
        // Filter by user_id dari database
        filteredData = formattedData.filter(item => {
          // Cek jika logbook punya user_id field
          return item.user_id && item.user_id === studentUserId
        })
        
        console.log('[Logbook Filter] Filtered by user_id:', filteredData.length)
        
        // Jika ada user_id tapi tidak ada hasil, fallback ke nama
        if (filteredData.length === 0 && studentNameFilter) {
          console.log('[Logbook Filter] No results with user_id, falling back to nama filter')
        } else if (filteredData.length > 0) {
          // Jika user_id filter sukses, skip nama filter
          console.log('[Logbook Filter] ✅ Successfully filtered by user_id')
        }
      }
      
      // Priority 2: Filter by nama if user_id not available or no results
      if ((!studentUserId || filteredData.length === 0) && studentNameFilter && typeof studentNameFilter === 'string') {
        const filterTrim = studentNameFilter.trim().toLowerCase()
        console.log('[Logbook Filter] Filtering by nama:', filterTrim)
        console.log('[Logbook Filter] Available names:', formattedData.map(item => item.nama_siswa.toLowerCase()))
        
        // Try exact match first
        const exactMatches = formattedData.filter(item => (item.nama_siswa || '').trim().toLowerCase() === filterTrim)
        
        // If no exact match, try includes
        const includesMatches = formattedData.filter(item => (item.nama_siswa || '').toLowerCase().includes(filterTrim))
        
        filteredData = exactMatches.length > 0 ? exactMatches : includesMatches
        
        console.log('[Logbook Filter] Exact nama matches:', exactMatches.length)
        console.log('[Logbook Filter] Includes nama matches:', includesMatches.length)
        console.log('[Logbook Filter] Final filtered by nama:', filteredData.length)
      }

      const mappedData = filteredData.map(item => ({
        ...item,
        status: item.status === 'menunggu' ? 'Menunggu Verifikasi' : 
               item.status === 'pending' ? 'Pending' :
               item.status === 'disetujui' ? 'Disetujui' :
               item.status === 'ditolak' ? 'Ditolak' : item.status
      }))

      console.log("✅ Logbook data loaded successfully:", mappedData.length, "items")
      
      // Clear timeout on success
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      
      setData(mappedData)
      setError(null)
    } catch (err) {
      console.error("❌ Error loading logbook data:", err)
      
      // Clear timeout on error
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      
      setError(err instanceof Error ? err.message : "Unknown error")
      setData([])
    } finally {
      setLoading(false)
    }
  }, [studentUserId, studentNameFilter])

  React.useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  // Realtime: otomatis reload ketika ada perubahan di tabel `logbook`
  React.useEffect(() => {
    if (!supabaseBrowser) return

    console.log("🔴 Setting up realtime subscription for Logbook table")

    const channel = supabaseBrowser
      .channel(`realtime-logbook-${Date.now()}`) // Unique channel name
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "logbook" },
        (payload) => {
          console.log("🔔 Logbook data changed:", payload.eventType)
          loadData()
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime subscription status:", status)
      })

    return () => {
      console.log("🔴 Cleaning up realtime subscription for Logbook")
      if (supabaseBrowser) {
        supabaseBrowser.removeChannel(channel)
      }
      // Clear timeout on cleanup
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency - only setup once

  const handleDelete = async (id: string | number) => {
    // Tampilkan toast konfirmasi dengan action buttons
    toast("Apakah Anda yakin ingin menghapus data logbook ini?", {
      action: {
        label: "Hapus",
        onClick: async () => {
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
      },
      cancel: {
        label: "Batal",
        onClick: () => {
          toast.info("Penghapusan dibatalkan")
        }
      },
      duration: 5000
    })
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
            <CardTitle></CardTitle>
            <CardDescription>

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
                <TableHead className="w-[180px] sm:w-[220px]">Siswa & Tanggal</TableHead>
                <TableHead className="w-[80px] sm:w-[100px] text-center">Media</TableHead>
                <TableHead className="w-[250px] sm:w-[300px]">Kegiatan & Kendala</TableHead>
                <TableHead className="w-[100px] sm:w-[120px]">Status</TableHead>
                {/* Sembunyikan kolom catatan di layar kecil untuk menjaga proporsi */}
                <TableHead className="w-[250px] hidden lg:table-cell">Catatan</TableHead>
                <TableHead className="w-[80px] sm:w-[100px] text-center">Aksi</TableHead>
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
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {item.foto && (() => {
                        try {
                          const mediaInfo = JSON.parse(item.foto)
                          return (
                            <div className="flex flex-col items-center space-y-1">
                              <p className="text-xs font-medium text-gray-600 mb-2">Media</p>
                              <div className="relative group">
                                <div className="relative">
                                  <MediaPreview
                                    url={mediaInfo.url}
                                    type={mediaInfo.type === 'image' ? 'image' : 'video'}
                                    alt={`Media ${item.id}`}
                                    className="w-12 h-12 sm:w-16 sm:h-16"
                                  />
                                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
                                    {mediaInfo.type === 'image' ? (
                                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white">📷</span>
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white">🎥</span>
                                      </div>
                                    )}
                                  </div>
                                  {mediaInfo.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      <div className="w-6 h-6 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                                        <span className="text-xs">▶️</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 truncate max-w-[80px] sm:max-w-[120px]">
                                {mediaInfo.filename || 'Media'}
                              </p>
                            </div>
                          )
                        } catch {
                          // Fallback for old format
                          return (
                            <div className="flex flex-col items-center space-y-1">
                              <p className="text-xs font-medium text-gray-600 mb-2">Media</p>
                              <div className="relative">
                                <MediaPreview
                                  url={item.foto}
                                  type="image"
                                  alt={`Media ${item.id}`}
                                  className="w-12 h-12 sm:w-16 sm:h-16"
                                />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center pointer-events-none">
                                  <span className="text-xs text-white">📷</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">Foto Lama</p>
                            </div>
                          )
                        }
                      })() || (
                        <div className="flex flex-col items-center space-y-1">
                          <p className="text-xs font-medium text-gray-600 mb-2">Media</p>
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-400">Tidak ada</span>
                          </div>
                        </div>
                      )}
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
