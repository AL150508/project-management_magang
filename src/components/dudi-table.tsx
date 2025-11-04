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
import { IconBuilding, IconEdit, IconMapPin, IconMail, IconPhone, IconUser, IconTrash, IconPlus, IconSearch } from "@tabler/icons-react"
import { toast } from "sonner"

export type DudiItem = {
  id: string | number
  nama_perusahaan: string
  alamat?: string
  telepon?: string
  email?: string
  penanggung_jawab?: string
  jumlah_siswa?: number
  created_at?: string
  updated_at?: string
}

type DudiTableProps = {
  onEdit: (dudi: DudiItem) => void
  onDelete: (id: string | number) => void
  onAdd?: () => void
}

export function DudiTable({ onEdit, onDelete, onAdd }: DudiTableProps) {
  const [data, setData] = React.useState<DudiItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [pageSize, setPageSize] = React.useState(5)
  const [currentPage, setCurrentPage] = React.useState(1)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      console.log("Loading DUDI data...")
      
      // Check if Supabase is properly configured
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }

      const { data: dudiData, error } = await supabaseBrowser
        .from("dudi")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("DUDI data loaded successfully:", dudiData)
      
      // Set data from database (empty array if no data)
      setData(dudiData || [])
      
      setError(null) // Clear any previous errors
      
    } catch (error) {
      console.error("Error loading DUDI data:", error)
      
      // Better error message for user
      let errorMessage = "Gagal memuat data DUDI"
      if (error instanceof Error) {
        if (error.message.includes("Database error")) {
          errorMessage = "Gagal terhubung ke database"
        } else if (error.message.includes("Supabase client")) {
          errorMessage = "Konfigurasi database tidak lengkap"
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data
    return data.filter(item =>
      item.nama_perusahaan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alamat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.penanggung_jawab?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)


  if (loading) {
    return (
      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBuilding className="size-5 text-blue-600" />
            Memuat data DUDI...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-blue-100/30 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl border border-red-100/60 bg-white/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <IconBuilding className="size-5 text-red-600" />
            Error Memuat Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => {
                setError(null)
                loadData()
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconBuilding className="size-5 text-blue-600" />
              Daftar DUDI
            </CardTitle>
            <CardDescription>Kelola data perusahaan mitra</CardDescription>
          </div>
          {onAdd && (
            <Button
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <IconPlus className="size-4 mr-2" />
              Tambah DUDI
            </Button>
          )}
        </div>
        
        {/* Search and Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Cari perusahaan, alamat, penanggung jawab"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Tampilkan:</span>
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
            <span className="text-sm text-slate-600">entri</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Wrapper agar tabel bisa di-scroll horizontal pada layar kecil */}
        <div className="rounded-lg border border-blue-100/50 overflow-x-auto">
          <Table className="min-w-[720px] md:min-w-full">
            <TableHeader className="bg-blue-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Perusahaan</TableHead>
                {/* Sembunyikan kolom kontak di layar sangat kecil agar tetap proporsional */}
                <TableHead className="font-semibold text-slate-700 hidden sm:table-cell">Kontak</TableHead>
                <TableHead className="font-semibold text-slate-700 hidden md:table-cell">Penanggung Jawab</TableHead>
                <TableHead className="font-semibold text-slate-700 text-nowrap">Siswa Magang</TableHead>
                <TableHead className="font-semibold text-slate-700 text-nowrap">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Belum ada data DUDI"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((dudi) => (
                  <TableRow key={dudi.id} className="hover:bg-blue-50/30">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 flex size-8 items-center justify-center rounded-lg mt-1">
                          <IconBuilding className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{dudi.nama_perusahaan}</div>
                          {dudi.alamat && (
                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                              <IconMapPin className="size-3" />
                              {dudi.alamat}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="space-y-1">
                        {dudi.email && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <IconMail className="size-3" />
                            {dudi.email}
                          </div>
                        )}
                        {dudi.telepon && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <IconPhone className="size-3" />
                            {dudi.telepon}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {dudi.penanggung_jawab && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <IconUser className="size-3" />
                          {dudi.penanggung_jawab}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {dudi.jumlah_siswa && (
                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                          {dudi.jumlah_siswa}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(dudi)}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                        >
                          <IconEdit className="size-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(dudi.id)}
                          className="h-8 w-8 p-0 hover:bg-red-100"
                        >
                          <IconTrash className="size-4 text-red-600" />
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
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Menampilkan {((currentPage - 1) * pageSize) + 1} sampai {Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length} entri
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-slate-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
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
