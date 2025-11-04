"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconBuilding, IconMapPin, IconUser, IconUsers } from "@tabler/icons-react"
// import { toast } from "sonner" // Not used in this component
import { DudiRegistrationModal } from "./dudi-registration-modal"

export type DudiItem = {
  id: string | number
  nama_perusahaan: string
  bidang_usaha: string
  alamat: string
  pic: string
  kuota_magang: number
  kuota_terisi: number
  status?: "Tersedia" | "Penuh" | "Menunggu"
  deskripsi?: string
  created_at?: string
  updated_at?: string
}

export function DudiCards() {
  const [data, setData] = React.useState<DudiItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedDudi, setSelectedDudi] = React.useState<DudiItem | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  // State utama:
  // - data: daftar DUDI untuk ditampilkan
  // - loading/error: status fetch
  // - selectedDudi/modalOpen: untuk membuka modal pendaftaran

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      console.log("Loading DUDI data...")
      
      if (!supabaseBrowser) {
        throw new Error("Supabase client not initialized")
      }

      const { data: dudiData, error } = await supabaseBrowser!
        .from("dudi")
        .select("*")
        .order("nama_perusahaan", { ascending: true })
      // Query utama: ambil semua DUDI dan urutkan. Jika perlu paging/filter,
      // tambahkan .range() atau .ilike() di sini.

      if (error) {
        console.error("Supabase error:", error.message || error)
        throw new Error(`Database error: ${error.message || 'Unknown error'}`)
      }

      console.log("DUDI data loaded successfully:", dudiData)
      
      // Ambil data magang untuk menghitung kuota terisi aktual (berdasarkan input guru)
      const magangCounts: Record<string, number> = {}
      try {
        const { data: magangData, error: magangError } = await supabaseBrowser
          .from("magang")
          .select("nama_dudi,status")
        // Jika kolom/relasi berganti, sesuaikan select di atas.

        if (magangError) {
          console.warn("Supabase magang error:", magangError.message || magangError)
        } else if (magangData) {
          // Hitung hanya yang statusnya Aktif atau Selesai
          for (const row of magangData as Array<{ nama_dudi: string | null; status?: string }>) {
            if (!row?.nama_dudi) continue
            if (row.status === "Aktif" || row.status === "Selesai") {
              magangCounts[row.nama_dudi] = (magangCounts[row.nama_dudi] || 0) + 1
            }
          }
        }
      } catch (e) {
        console.warn("Gagal mengambil data magang untuk perhitungan kuota terisi", e)
      }

      // Map data dari struktur tabel `dudi` ke struktur DudiItem dan sesuaikan kuota terisi
      let mapped: DudiItem[] = (dudiData || []).map((row: Record<string, unknown>) => {
        const namaPerusahaan = (row.nama_perusahaan as string) || ""
        const kuota = (row.kuota_magang as number) ?? 0
        const terisiFromDB = (row.kuota_terisi as number) ?? 0
        const terisiFromMagang = magangCounts[namaPerusahaan] || 0
        // Pakai nilai terbesar agar mengikuti input guru (magang) bila ada
        const kuotaTerisi = Math.max(terisiFromDB, terisiFromMagang)

        const safeKuota = kuota > 0 ? kuota : 6 // default kuota jika 0 agar tidak semua 0
        let boundedTerisi = Math.min(kuotaTerisi, safeKuota)

        // Jika belum ada data terisi dari DB maupun tabel magang, gunakan dummy ringan agar tidak 0 semua
        if (boundedTerisi === 0 && safeKuota > 0) {
          const fallback = Math.min(safeKuota - 1, Math.max(1, Math.floor(safeKuota * 0.2)))
          boundedTerisi = fallback
        }

        return {
          id: row.id as string | number,
          nama_perusahaan: namaPerusahaan,
          bidang_usaha: (row.bidang_usaha as string) || "",
          alamat: (row.alamat as string) || "",
          pic: (row.pic as string) || "",
          kuota_magang: safeKuota,
          kuota_terisi: boundedTerisi,
          status: getStatus(safeKuota, boundedTerisi),
          deskripsi: (row.deskripsi as string) || "",
          created_at: row.created_at as string,
          updated_at: row.updated_at as string
        }
      })
      // NOTE: Jika struktur tabel berubah, sesuaikan pemetaan di atas.

      // If no data from database, use dummy data for demo
      if (mapped.length === 0) {
        mapped = [
          {
            id: 1,
            nama_perusahaan: "PT Kreatif Teknologi",
            bidang_usaha: "Teknologi Informasi",
            alamat: "Jl. Merdeka No. 123, Jakarta",
            pic: "Andi Wijaya",
            kuota_magang: 12,
            kuota_terisi: 8,
            status: "Menunggu",
            deskripsi: "Perusahaan teknologi yang bergerak di bidang pengembangan aplikasi mobile dan web."
          },
          {
            id: 2,
            nama_perusahaan: "CV Digital Solusi",
            bidang_usaha: "Digital Marketing",
            alamat: "Jl. Sudirman No. 456, Bandung",
            pic: "Sari Indah",
            kuota_magang: 8,
            kuota_terisi: 5,
            status: "Tersedia",
            deskripsi: "Agen digital marketing yang membantu bisnis mengembangkan strategi pemasaran online."
          },
          {
            id: 3,
            nama_perusahaan: "PT Inovasi Mandiri",
            bidang_usaha: "Software Development",
            alamat: "Jl. Gatot Subroto No. 789, Surabaya",
            pic: "Budi Santoso",
            kuota_magang: 15,
            kuota_terisi: 12, 
            status: "Tersedia",
            deskripsi: "Perusahaan pengembang software yang fokus pada solusi enterprise dan sistem informasi."
          }
        ]
      }

      setData(mapped)
      setError(null)
    } catch (err) {
      console.error("Error loading DUDI data:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const getStatus = (kuota: number, terisi: number) => {
    if (terisi >= kuota) return "Penuh"
    if (terisi >= kuota * 0.8) return "Menunggu"
    return "Tersedia"
  }
  // Rumus status: Penuh (>=kuota), Menunggu (>=80%), selain itu Tersedia.
  // Ubah ambang 0.8 bila kebijakan berbeda.

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
  // Warna badge per status. Edit class tailwind jika ingin gaya berbeda.

  const getProgressPercentage = (terisi: number, kuota: number) => {
    if (kuota === 0) return 0
    return Math.round((terisi / kuota) * 100)
  }
  // Persentase progress bar kuota.

  const handleRegister = (dudi: DudiItem) => {
    setSelectedDudi(dudi)
    setModalOpen(true)
  }
  // Klik daftar magang: set DUDI terpilih dan buka modal.

  const handleRegistrationSuccess = () => {
    // Reload data to update quota
    loadData()
  }
  // Setelah pendaftaran sukses, refresh agar kuota ter-update.

  React.useEffect(() => {
    loadData()
  }, [loadData])

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
              <div className="h-2 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadData} variant="outline">
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
        data.map((dudi) => (
          <Card key={dudi.id} className="p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300">
            <CardContent className="p-0">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <IconBuilding className="w-5 h-5 text-orange-600" />
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
                      {dudi.kuota_terisi}/{dudi.kuota_magang}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(dudi.kuota_terisi, dudi.kuota_magang)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{dudi.kuota_magang - dudi.kuota_terisi} slot tersisa</span>
                    <div className="flex items-center gap-1">
                      <IconUsers className="w-3 h-3" />
                      <span>{getProgressPercentage(dudi.kuota_terisi, dudi.kuota_magang)}% terisi</span>
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
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200"
                  disabled={dudi.status === "Penuh"}
                  onClick={() => handleRegister(dudi)}
                >
                  {dudi.status === "Penuh" ? "Kuota Penuh" : "Daftar Magang"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
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

