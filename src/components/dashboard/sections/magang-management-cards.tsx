/**
 * REFACTORED: Dashboard Section - Magang Management Cards
 * 
 * File: src/components/dashboard/sections/magang-management-cards.tsx
 * 
 * SEARCHABLE COMMENTS:
 * - REFACTORED_DASHBOARD_SECTION: Komponen section untuk manajemen magang dalam bentuk cards
 * - DASHBOARD_MAGANG_MANAGEMENT: Manajemen data magang dengan grouping berdasarkan status
 * - DASHBOARD_MAGANG_CARDS_LAYOUT: Layout cards untuk magang aktif dan selesai
 * - DASHBOARD_MAGANG_NILAI: Sistem penilaian magang dengan modal
 * - DASHBOARD_MAGANG_STATUS: Status badge dan color coding
 * 
 * FUNGSI:
 * - Menampilkan data magang dalam bentuk cards
 * - Grouping berdasarkan status (Aktif, Selesai)
 * - Sistem penilaian dengan modal input
 * - Status badge dan color coding
 * - Loading state dan empty state
 */

"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconUser, IconEdit, IconStar, IconSchool, IconCalendar } from "@tabler/icons-react"
import { toast } from "sonner"

export type MagangManagementItem = {
  id: string | number
  nama_siswa: string
  nis?: string
  kelas?: string
  jurusan?: string
  nama_dudi: string
  bidang_usaha?: string
  periode_mulai: string
  periode_selesai: string
  status: "Aktif" | "Selesai" | "Pending"
  nilai?: number
  created_at: string
  updated_at: string
}

type MagangManagementCardsProps = {
  onRefresh?: () => void
}

export function MagangManagementCards({ onRefresh }: MagangManagementCardsProps) {
  const [data, setData] = React.useState<MagangManagementItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedItem, setSelectedItem] = React.useState<MagangManagementItem | null>(null)
  const [showNilaiModal, setShowNilaiModal] = React.useState(false)
  const [nilai, setNilai] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState(false)

  // DASHBOARD_MAGANG_MANAGEMENT: Load data magang dari database
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      if (!supabaseBrowser) {
        console.warn("Supabase client not available, using empty data")
        setData([])
        return
      }

      const { data: magangData, error } = await supabaseBrowser
        .from("magang")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading magang data:", error)
        setData([])
        return
      }

      if (!magangData || magangData.length === 0) {
        console.log("No magang data found")
        setData([])
        return
      }

      const formattedData: MagangManagementItem[] = magangData.map((item: Record<string, unknown>) => {
        try {
          return {
            id: item.id,
            nama_siswa: item.nama_siswa || "",
            nis: item.nis || "",
            kelas: item.kelas || "",
            jurusan: item.jurusan || "",
            nama_dudi: item.nama_dudi || "",
            bidang_usaha: item.bidang_usaha || "",
            periode_mulai: item.periode_mulai || item.tanggal_mulai || "",
            periode_selesai: item.periode_selesai || item.tanggal_selesai || "",
            status: (item.status === "Aktif" || item.status === "Selesai" || item.status === "Pending") 
              ? item.status as "Aktif" | "Selesai" | "Pending"
              : "Pending",
            nilai: item.nilai || undefined,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString()
          }
        } catch (itemError) {
          console.error("Error formatting item:", itemError, item)
          return null
        }
      }).filter(Boolean) as MagangManagementItem[]

      setData(formattedData)
    } catch (err) {
      console.error("Error loading data:", err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // DASHBOARD_MAGANG_STATUS: Status badge dan color coding
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>
      case "Selesai":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Selesai</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // DASHBOARD_MAGANG_NILAI: Nilai badge dengan grade
  const getNilaiBadge = (nilai?: number) => {
    if (!nilai) return <span className="text-gray-500 text-sm">Belum dinilai</span>
    
    if (nilai >= 85) {
      return <Badge className="bg-green-100 text-green-800">A ({nilai})</Badge>
    } else if (nilai >= 75) {
      return <Badge className="bg-blue-100 text-blue-800">B ({nilai})</Badge>
    } else if (nilai >= 65) {
      return <Badge className="bg-yellow-100 text-yellow-800">C ({nilai})</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">D ({nilai})</Badge>
    }
  }

  // DASHBOARD_MAGANG_NILAI: Handle modal nilai
  const handleNilai = (item: MagangManagementItem) => {
    setSelectedItem(item)
    setNilai(item.nilai?.toString() || "")
    setShowNilaiModal(true)
  }

  // DASHBOARD_MAGANG_NILAI: Save nilai ke database
  const handleSaveNilai = async () => {
    if (!selectedItem) return

    setActionLoading(true)
    try {
      if (!supabaseBrowser) {
        toast.error("Database tidak tersedia")
        return
      }

      const { error } = await supabaseBrowser
        .from("magang")
        .update({
          nilai: parseInt(nilai) || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedItem.id)

      if (error) {
        console.error("Error updating nilai:", error)
        toast.error("Gagal menyimpan nilai")
        return
      }

      toast.success("Nilai berhasil disimpan")
      setShowNilaiModal(false)
      loadData()
      onRefresh?.()

    } catch (err) {
      console.error("Error saving nilai:", err)
      toast.error("Terjadi kesalahan")
    } finally {
      setActionLoading(false)
    }
  }

  // DASHBOARD_MAGANG_CARDS_LAYOUT: Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* DASHBOARD_MAGANG_CARDS_LAYOUT: Active Magang */}
        {data.filter(item => item.status === "Aktif").length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconSchool className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Magang Aktif ({data.filter(item => item.status === "Aktif").length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.filter(item => item.status === "Aktif").map((item) => (
                <Card key={item.id} className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <IconUser className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{item.nama_siswa}</CardTitle>
                          <CardDescription className="text-xs">{item.nis || "NIS tidak tersedia"}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.nama_dudi}</p>
                      <p className="text-xs text-gray-600">{item.bidang_usaha}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <IconCalendar className="w-3 h-3" />
                      <span>{item.periode_mulai} - {item.periode_selesai}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-medium">Nilai: </span>
                        {getNilaiBadge(item.nilai)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNilai(item)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <IconEdit className="w-3 h-3 mr-1" />
                        Nilai
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* DASHBOARD_MAGANG_CARDS_LAYOUT: Completed Magang */}
        {data.filter(item => item.status === "Selesai").length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconStar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Magang Selesai ({data.filter(item => item.status === "Selesai").length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.filter(item => item.status === "Selesai").map((item) => (
                <Card key={item.id} className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{item.nama_siswa}</CardTitle>
                          <CardDescription className="text-xs">{item.nis || "NIS tidak tersedia"}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.nama_dudi}</p>
                      <p className="text-xs text-gray-600">{item.bidang_usaha}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <IconCalendar className="w-3 h-3" />
                      <span>{item.periode_mulai} - {item.periode_selesai}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-medium">Nilai: </span>
                        {getNilaiBadge(item.nilai)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNilai(item)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <IconEdit className="w-3 h-3 mr-1" />
                        Edit Nilai
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <IconSchool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data magang</h3>
              <p className="text-gray-600">Belum ada siswa yang terdaftar magang</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* DASHBOARD_MAGANG_NILAI: Nilai Modal */}
      <Dialog open={showNilaiModal} onOpenChange={setShowNilaiModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Berikan Nilai Magang</DialogTitle>
            <DialogDescription>
              Berikan nilai untuk {selectedItem?.nama_siswa} di {selectedItem?.nama_dudi}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nilai">Nilai (0-100)</Label>
              <Input
                id="nilai"
                type="number"
                min="0"
                max="100"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                placeholder="Masukkan nilai 0-100"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Kriteria Penilaian:</strong></p>
              <p>• 85-100: A (Sangat Baik)</p>
              <p>• 75-84: B (Baik)</p>
              <p>• 65-74: C (Cukup)</p>
              <p>• 0-64: D (Kurang)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNilaiModal(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveNilai}
              disabled={actionLoading || !nilai || parseInt(nilai) < 0 || parseInt(nilai) > 100}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? "Menyimpan..." : "Simpan Nilai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
