"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { IconBuilding, IconCalendar, IconUser, IconId, IconSchool } from "@tabler/icons-react"

interface StatusMagangSiswaProps {
  data?: {
    namaSiswa: string
    nis: string
    kelas: string
    jurusan: string
    namaPerusahaan: string
    alamatPerusahaan: string
    periodeMulai: string
    periodeSelesai: string
    status: "aktif" | "selesai" | "belum_mulai"
    nilaiAkhir?: number
    sudahDinilai?: boolean
  }
  studentName?: string
}

export function StatusMagangSiswa({ data, studentName }: StatusMagangSiswaProps) {
  const [magangData, setMagangData] = React.useState<typeof data | null>(data || null)
  const [loading, setLoading] = React.useState(false)
  const [, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    async function fetchData() {
      if (data) return
      if (!studentName) return
      
      try {
        setLoading(true)
        if (!supabaseBrowser) return
        
        // Dapatkan user ID dari Supabase Auth
        const { data: { user } } = await supabaseBrowser.auth.getUser()
        
        if (!user) {
          console.log("⚠️ User tidak terautentikasi")
          setMagangData(null)
          return
        }
        
        const userId = user.id

        // Ambil data magang untuk user ini
        let rows: Record<string, unknown>[] | null = null
        try {
          // Try dengan filter user_id first
          const { data, error } = await supabaseBrowser
            .from("magang")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10)
          
          if (error) throw error
          rows = data as Record<string, unknown>[] | null
          
          // Jika tidak ada data dengan user_id, fallback ke nama siswa
          if (!rows || rows.length === 0) {
            const { data: fallbackData } = await supabaseBrowser
              .from("magang")
              .select("*")
              .or(`Siswa.eq.${studentName},nama_siswa.eq.${studentName}`)
              .order("created_at", { ascending: false })
              .limit(10)
            rows = fallbackData as Record<string, unknown>[] | null
          }
        } catch (err) {
          console.error("Error fetching magang data:", err)
          // Fallback tanpa filter
          try {
            const { data } = await supabaseBrowser
              .from("magang")
              .select("*")
              .limit(50)
            rows = data as Record<string, unknown>[] | null
          } catch {
            rows = null
          }
        }

        // Ambil row pertama (sudah difilter by user_id di query)
        const row = rows && rows.length > 0 ? rows[0] : null
        if (!row) {
          if (!isMounted) return
          setMagangData(null)
        } else {
          const mapped = {
            namaSiswa: studentName, // Gunakan nama siswa dari prop, bukan dari database
            nis: (row["NIS"] as string) || (row["nis"] as string) || "-",
            kelas: (row["Kelas"] as string) || (row["kelas"] as string) || "-",
            jurusan: (row["Jurusan"] as string) || (row["jurusan"] as string) || "-",
            namaPerusahaan: (row["DUDI"] as string) || (row["nama_dudi"] as string) || (row["nama_perusahaan"] as string) || "-",
            alamatPerusahaan: "-",
            periodeMulai: (row["Mulai"] as string) || (row["periode_mulai"] as string) || "-",
            periodeSelesai: (row["Selesai"] as string) || (row["periode_selesai"] as string) || "-",
            status: ((row["Status"] as string) || (row["status"] as string) || 'Pending').toLowerCase() === 'aktif' ? 'aktif' as const
                    : ((row["Status"] as string) || (row["status"] as string) || 'Pending').toLowerCase() === 'selesai' ? 'selesai' as const
                    : 'belum_mulai' as const,
            nilaiAkhir: undefined,
            sudahDinilai: false,
          }
          if (!isMounted) return
          setMagangData(mapped)
        }
      } catch (e) {
        if (!isMounted) return
        console.error("Error in fetchData:", e)
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [data, studentName])

  const getStatusBadge = () => {
    if (!magangData) return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Belum Mengajukan</Badge>
    switch (magangData.status) {
      case "aktif":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>
      case "selesai":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Selesai</Badge>
      case "belum_mulai":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Belum Dimulai</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Tidak Diketahui</Badge>
    }
  }

  const formatPeriode = () => {
    if (!magangData) return "-"
    return `${magangData.periodeMulai} s.d ${magangData.periodeSelesai}`
  }

  const getNilaiDisplay = () => {
    if (!magangData) return null
    if (magangData.status === "selesai") {
      if (magangData.sudahDinilai && magangData.nilaiAkhir !== undefined) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Nilai Akhir:</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-lg px-3 py-1">
              {magangData.nilaiAkhir}
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

  // Empty state: belum mengajukan
  if (!magangData && !loading) {
    return (
      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 flex size-8 items-center justify-center rounded-lg">
              <IconUser className="size-4" />
            </div>
            Status Magang Saya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-6">
            <p className="text-gray-700">Anda belum mengajukan magang atau belum ditempatkan.</p>
            <a href="/dudi">
              <Button className="bg-blue-600 hover:bg-blue-700">Cari Tempat Magang</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Status Magang Saya
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Lihat informasi detail tempat dan status magang Anda
        </p>
      </div>

      {/* Data Magang Card */}
      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 flex size-8 items-center justify-center rounded-lg">
              <IconUser className="size-4" />
            </div>
            Data Magang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informasi Siswa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <IconUser className="size-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Nama Siswa:</span>
                  <p className="font-medium text-gray-900">{magangData?.namaSiswa}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <IconId className="size-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">NIS:</span>
                  <p className="font-medium text-gray-900">{magangData?.nis}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <IconSchool className="size-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Kelas:</span>
                  <p className="font-medium text-gray-900">{magangData?.kelas}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <IconSchool className="size-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Jurusan:</span>
                  <p className="font-medium text-gray-900">{magangData?.jurusan}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <IconBuilding className="size-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Nama Perusahaan:</span>
                  <p className="font-medium text-gray-900">{magangData?.namaPerusahaan}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <IconCalendar className="size-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Periode Magang:</span>
                  <p className="font-medium text-gray-900">{formatPeriode()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status dan Nilai */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                {magangData ? getStatusBadge() : <Badge className="bg-gray-100 text-gray-700 border-gray-200">Belum Mengajukan</Badge>}
              </div>
              {getNilaiDisplay()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
