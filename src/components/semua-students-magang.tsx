"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { 
  IconBuilding, 
  IconCalendar, 
  IconUser, 
  IconId, 
  IconSchool,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
  IconSortAscending,
  IconSortDescending
} from "@tabler/icons-react"
import { toast } from "sonner"

interface StudentMagangData {
  id: string
  namaSiswa: string
  nis: string
  kelas: string
  jurusan: string
  namaPerusahaan: string
  alamatPerusahaan: string
  periodeMulai: string
  periodeSelesai: string
  status: "aktif" | "selesai" | "belum_mulai" | "pending"
  nilaiAkhir?: number
  sudahDinilai?: boolean
}

interface FilterState {
  kelas: string
  jurusan: string
  perusahaan: string
  status: string
}

interface SortState {
  field: "perusahaan" | ""
  direction: "asc" | "desc"
}

export function SemuaStudentsMagang() {
  const [data, setData] = React.useState<StudentMagangData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [totalCount, setTotalCount] = React.useState(0)
  const [limit, setLimit] = React.useState(10)
  const [hasMore, setHasMore] = React.useState(true)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filters, setFilters] = React.useState<FilterState>({
    kelas: "",
    jurusan: "",
    perusahaan: "",
    status: ""
  })
  const [sort, setSort] = React.useState<SortState>({ field: "", direction: "asc" })
  
  const kelasOptions = ["X RPL 1", "X RPL 2", "XI RPL 1", "XI RPL 2", "XII RPL 1", "XII RPL 2"]
  const jurusanOptions = ["Rekayasa perangkat lunak", "Teknik Komputer Jaringan", "Multimedia"]
  const statusOptions = [
    { value: "aktif", label: "Aktif" },
    { value: "selesai", label: "Selesai" },
    { value: "pending", label: "Pending" },
    { value: "belum_mulai", label: "Belum Dimulai" }
  ]
  const [perusahaanOptions, setPerusahaanOptions] = React.useState<string[]>([])

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }

      let query = supabaseBrowser
        .from("magang")
        .select("*", { count: 'exact' })

      // Apply search
      if (searchTerm) {
        query = query.or(`nama_siswa.ilike.%${searchTerm}%,Siswa.ilike.%${searchTerm}%,nama_dudi.ilike.%${searchTerm}%,DUDI.ilike.%${searchTerm}%`)
      }

      // Apply filters
      if (filters.kelas && filters.kelas !== "all") {
        query = query.or(`kelas.eq.${filters.kelas},Kelas.eq.${filters.kelas}`)
      }
      if (filters.jurusan && filters.jurusan !== "all") {
        query = query.or(`jurusan.eq.${filters.jurusan},Jurusan.eq.${filters.jurusan}`)
      }
      if (filters.perusahaan && filters.perusahaan !== "all") {
        query = query.or(`nama_dudi.eq.${filters.perusahaan},DUDI.eq.${filters.perusahaan}`)
      }
      if (filters.status && filters.status !== "all") {
        query = query.or(`status.eq.${filters.status},Status.eq.${filters.status}`)
      }

      // Apply sorting
      if (sort.field) {
        const sortField = sort.field === "perusahaan" ? "nama_dudi" : "created_at"
        query = query.order(sortField, { ascending: sort.direction === "asc" })
      } else {
        try {
          query = query.order("created_at", { ascending: false })
        } catch {
          query = query.order("id", { ascending: false })
        }
      }

      // Apply limit for infinite scroll
      query = query.limit(limit)

      const { data: magangData, error, count } = await query

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      const transformedData = (magangData || []).map((item: any, index: number) => ({
        id: item.id || String(index),
        namaSiswa: item.nama_siswa || item.Siswa || "Tidak diketahui",
        nis: item.nis || item.NIS || "-",
        kelas: item.kelas || item.Kelas || "-",
        jurusan: item.jurusan || item.Jurusan || "-",
        namaPerusahaan: item.nama_dudi || item.DUDI || "Tidak diketahui",
        alamatPerusahaan: "-",
        periodeMulai: item.periode_mulai || item.Mulai || "-",
        periodeSelesai: item.periode_selesai || item.Selesai || "-",
        status: ((item.status || item.Status || 'pending').toLowerCase() === 'aktif' ? 'aktif' as const
                : (item.status || item.Status || 'pending').toLowerCase() === 'selesai' ? 'selesai' as const
                : (item.status || item.Status || 'pending').toLowerCase() === 'belum_mulai' ? 'belum_mulai' as const
                : 'pending' as const),
        nilaiAkhir: item.nilai || undefined,
        sudahDinilai: Boolean(item.nilai)
      }))

      setData(transformedData)
      setTotalCount(count || 0)
      setHasMore(transformedData.length < (count || 0))
      
      const uniquePerusahaan = [...new Set(
        transformedData.map(item => item.namaPerusahaan).filter(p => p !== "Tidak diketahui")
      )]
      setPerusahaanOptions(uniquePerusahaan)
      
    } catch (error) {
      console.error("Error loading student magang data:", error)
      const errorMessage = error instanceof Error ? error.message : "Gagal memuat data siswa magang"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [limit, searchTerm, filters, sort])

  React.useEffect(() => {
    setLimit(10)
    fetchData()
  }, [searchTerm, filters, sort])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSortChange = (field: SortState["field"]) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }))
  }

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true)
      setLimit(prev => prev + 10)
      setTimeout(() => setLoadingMore(false), 500)
    }
  }

  // Intersection Observer untuk infinite scroll
  const loadMoreRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading])

  const hasFilters = (filters.kelas && filters.kelas !== "all") || (filters.jurusan && filters.jurusan !== "all") || (filters.perusahaan && filters.perusahaan !== "all") || (filters.status && filters.status !== "all") || searchTerm

  // Fungsi helper yang sama dengan StatusMagangSiswa
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aktif":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>
      case "selesai":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Selesai</Badge>
      case "belum_mulai":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Belum Dimulai</Badge>
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Tidak Diketahui</Badge>
    }
  }

  const formatPeriode = (mulai: string, selesai: string) => {
    if (mulai === "-" || selesai === "-") return "-"
    return `${mulai} s.d ${selesai}`
  }

  const getNilaiDisplay = (student: StudentMagangData) => {
    if (student.status === "selesai") {
      if (student.sudahDinilai && student.nilaiAkhir !== undefined) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Nilai Akhir:</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-lg px-3 py-1">
              {student.nilaiAkhir}
            </Badge>
          </div>
        )
      } else {
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Nilai Akhir:</span>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Menunggu Nilai
            </Badge>
          </div>
        )
      }
    }
    return null
  }

  if (error && !loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconUsers className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <IconRefresh className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - sama seperti StatusMagangSiswa */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Status Magang Siswa
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Lihat informasi detail tempat dan status magang seluruh siswa
        </p>
      </div>

      {/* Search & Controls */}
      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 flex size-8 items-center justify-center rounded-lg">
              <IconSearch className="size-4" />
            </div>
            Pencarian & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <Input
              placeholder="Cari nama siswa atau perusahaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="relative z-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={filters.kelas} onValueChange={(value) => handleFilterChange("kelas", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-md z-[9999]" position="popper">
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasOptions.map(kelas => (
                    <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.jurusan} onValueChange={(value) => handleFilterChange("jurusan", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jurusan" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-md z-[9999]" position="popper">
                  <SelectItem value="all">Semua Jurusan</SelectItem>
                  {jurusanOptions.map(jurusan => (
                    <SelectItem key={jurusan} value={jurusan}>{jurusan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.perusahaan} onValueChange={(value) => handleFilterChange("perusahaan", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Perusahaan" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-md z-[9999]" position="popper">
                  <SelectItem value="all">Semua Perusahaan</SelectItem>
                  {perusahaanOptions.map(perusahaan => (
                    <SelectItem key={perusahaan} value={perusahaan}>{perusahaan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-md z-[9999]" position="popper">
                  <SelectItem value="all">Semua Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Cards - Layout responsif: mobile=1, tablet=2, desktop=3 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconUsers className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasFilters ? "Tidak ada data yang sesuai" : "Belum ada data siswa magang"}
          </h3>
          <p className="text-gray-500 mb-4">
            {hasFilters 
              ? "Coba ubah filter pencarian atau reset filter untuk melihat semua data."
              : "Belum ada siswa yang terdaftar dalam program magang."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((student) => (
            // Card dengan layout panjang seperti foto referensi
            <Card key={student.id} className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 flex size-8 items-center justify-center rounded-lg">
                    <IconUser className="size-4" />
                  </div>
                  Data Magang
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Layout Horizontal seperti foto referensi */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Kolom Kiri - Informasi Siswa */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <IconUser className="size-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600">Nama Siswa:</span>
                        <p className="font-semibold text-gray-900 text-lg">{student.namaSiswa}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <IconId className="size-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600">NIS:</span>
                        <p className="font-medium text-gray-900">{student.nis}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <IconSchool className="size-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600">Kelas:</span>
                        <p className="font-medium text-gray-900">{student.kelas}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <IconSchool className="size-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600">Jurusan:</span>
                        <p className="font-medium text-gray-900">{student.jurusan}</p>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan - Informasi Perusahaan & Periode */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <IconBuilding className="size-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600">Nama Perusahaan:</span>
                        <p className="font-semibold text-gray-900 text-lg">{student.namaPerusahaan}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <IconCalendar className="size-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600">Periode Magang:</span>
                        <p className="font-medium text-gray-900">{formatPeriode(student.periodeMulai, student.periodeSelesai)}</p>
                      </div>
                    </div>
                    
                    {/* Status di kolom kanan */}
                    <div className="flex items-center gap-3">
                      <div className="size-4 flex-shrink-0" /> {/* Spacer untuk alignment */}
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className="mt-1">
                          {getStatusBadge(student.status)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Nilai jika ada */}
                    {getNilaiDisplay(student) && (
                      <div className="flex items-center gap-3">
                        <div className="size-4 flex-shrink-0" /> {/* Spacer untuk alignment */}
                        <div className="min-w-0">
                          {getNilaiDisplay(student)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger & Load More Indicator */}
      {!loading && data.length > 0 && (
        <div className="text-center py-6">
          <div className="text-sm text-gray-600 mb-4">
            Menampilkan {data.length} dari {totalCount} siswa
          </div>
          
          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Memuat lebih banyak...</span>
            </div>
          )}
          
          {/* End of Data Indicator */}
          {!hasMore && data.length > 0 && (
            <div className="text-sm text-gray-500 py-4">
              ✨ Semua data telah dimuat
            </div>
          )}
          
          {/* Intersection Observer Target */}
          <div ref={loadMoreRef} className="h-4" />
        </div>
      )}
    </div>
  )
}