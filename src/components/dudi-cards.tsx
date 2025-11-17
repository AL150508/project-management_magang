"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconBuilding, IconMapPin, IconUser, IconUsers } from "@tabler/icons-react"
import { DudiRegistrationModal } from "./dudi-registration-modal"

export type DudiItem = {
  id: string | number
  nama_perusahaan: string
  bidang_usaha?: string
  alamat?: string
  telepon?: string
  email?: string
  penanggung_jawab?: string
  pic?: string
  jumlah_siswa?: number
  kuota_magang?: number
  kuota_terisi?: number
  status?: "Tersedia" | "Penuh" | "Menunggu"
  deskripsi?: string
  latitude?: number
  longitude?: number
  created_at?: string
  updated_at?: string
  color?: string
}

// Warna konsisten untuk setiap perusahaan (sama dengan map)
const COMPANY_COLORS = {
  1: { bg: "bg-blue-100", icon: "text-blue-600", name: "blue" },
  2: { bg: "bg-green-100", icon: "text-green-600", name: "green" },
  3: { bg: "bg-purple-100", icon: "text-purple-600", name: "purple" },
  4: { bg: "bg-orange-100", icon: "text-orange-600", name: "orange" },
  5: { bg: "bg-red-100", icon: "text-red-600", name: "red" },
}

export function DudiCards() {
  const [data, setData] = React.useState<DudiItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedDudi, setSelectedDudi] = React.useState<DudiItem | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)

  // Load data from database
  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      console.log("Loading DUDI data for cards...")
      
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
      
      // Ambil data siswa magang untuk menghitung kuota terisi
      const { data: magangData } = await supabaseBrowser
        .from("magang")
        .select("DUDI,nama_dudi,nama_perusahaan,Status,status")
      
      type MagangRow = {
        DUDI?: string
        nama_dudi?: string
        nama_perusahaan?: string
        Status?: string
        status?: string
      }

      // Normalisasi dan hitung kuota terisi per DUDI (kecuali yang 'Ditolak')
      const kuotaTerisiMap = (magangData as MagangRow[] | null || []).reduce((acc: Record<string, number>, row: MagangRow) => {
        const rawStatus = (row.Status ?? row.status ?? "").toString()
        if (rawStatus === "Ditolak") return acc
        const rawName = (row.DUDI ?? row.nama_dudi ?? row.nama_perusahaan ?? "").toString()
        const key = rawName.trim().toLowerCase()
        if (!key) return acc
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      
      // Transform data ke kebutuhan kartu, dengan pencocokan nama case-insensitive
      const transformedData = (dudiData || []).map((item: Record<string, unknown>) => {
        const kuotaMagang = Number(item["jumlah_siswa"]) || 0
        const nameKey = String(item["nama_perusahaan"] || "").trim().toLowerCase()
        const kuotaTerisiCount = kuotaTerisiMap[nameKey] || 0
        
        return {
          ...(item as object),
          // Map database fields to card fields
          pic: (item["penanggung_jawab"] as string) || "Tidak ada PIC",
          bidang_usaha: (item["bidang_usaha"] as string) || "Belum ditentukan",
          kuota_magang: kuotaMagang,
          kuota_terisi: kuotaTerisiCount, // Data real dari tabel magang
          status: kuotaMagang > 0 && kuotaTerisiCount >= kuotaMagang ? "Penuh" : (kuotaMagang > 0 ? "Tersedia" : "Menunggu"),
          deskripsi: (item["deskripsi"] as string) || `Perusahaan ${item["nama_perusahaan"]} menyediakan program magang untuk siswa SMK.`
        } as DudiItem
      })
      
      setData(transformedData)
      setError(null)
      
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
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const getCompanyColor = (id: string | number) => {
    const numId = Number(id)
    return COMPANY_COLORS[numId as keyof typeof COMPANY_COLORS] || COMPANY_COLORS[1]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tersedia":
        return "bg-green-100 text-green-800 border-green-200"
      case "Menunggu":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Penuh":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProgressPercentage = (terisi: number, kuota: number) => {
    if (kuota === 0) return 0
    return Math.round((terisi / kuota) * 100)
  }

  const handleRegister = (dudi: DudiItem) => {
    setSelectedDudi(dudi)
    setModalOpen(true)
  }

  const handleRegistrationSuccess = () => {
    // Tutup modal dan refresh data supaya kuota terisi langsung ter-update
    setModalOpen(false)
    loadData()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => {
          const colors = getCompanyColor(i)
          return (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg animate-pulse`}></div>
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
                <div className="h-2 bg-gray-200 rounded animate-pulse w-full"></div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconBuilding className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada DUDI</h3>
          <p className="text-gray-500">Belum ada perusahaan mitra yang terdaftar.</p>
        </div>
      ) : (
        data.map((dudi) => {
          const colors = getCompanyColor(dudi.id)
          return (
            <Card key={dudi.id} id={`dudi-card-${dudi.id}`} className="p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300">
              <CardContent className="p-0">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                        <IconBuilding className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {dudi.nama_perusahaan}
                      </h3>
                      <p className="text-sm text-gray-600">{dudi.bidang_usaha}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(dudi.status || "Tersedia")} px-3 py-1 rounded-full text-xs font-medium`}
                  >
                    {dudi.status || "Tersedia"}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconMapPin className="w-4 h-4" />
                  <span className="truncate">{dudi.alamat}</span>
                </div>

                {/* PIC */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconUser className="w-4 h-4" />
                  <span>PIC: {dudi.pic}</span>
                </div>

                {/* Kuota Magang */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Kuota Magang</span>
                    <span className="font-medium text-gray-900">
                      {(dudi.kuota_terisi ?? 0)}/{(dudi.kuota_magang ?? 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(dudi.kuota_terisi ?? 0, dudi.kuota_magang ?? 0)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{(dudi.kuota_magang ?? 0) - (dudi.kuota_terisi ?? 0)} slot tersisa</span>
                    <div className="flex items-center gap-1">
                      <IconUsers className="w-3 h-3" />
                      <span>{getProgressPercentage(dudi.kuota_terisi ?? 0, dudi.kuota_magang ?? 0)}% terisi</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {dudi.deskripsi && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {dudi.deskripsi}
                  </p>
                )}

                {/* Action Button */}
                <Button 
                  className={`w-full transition-all duration-200 text-white ${colors.icon.replace('text-', 'bg-')} hover:${colors.icon.replace('text-', 'bg-')}/90`}
                  disabled={dudi.status === "Penuh"}
                  onClick={() => handleRegister(dudi)}
                >
                  {dudi.status === "Penuh" ? "Kuota Penuh" : "Daftar Magang"}
                </Button>
              </div>
            </CardContent>
          </Card>
          )
        })
      )}
      
      {/* Registration Modal */}
      <DudiRegistrationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        dudi={selectedDudi}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}
