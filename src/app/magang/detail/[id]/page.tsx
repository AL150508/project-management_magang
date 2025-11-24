"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { IconArrowLeft, IconCalendar, IconMapPin, IconSchool, IconUser, IconBuilding, IconClock, IconCheck, IconX, IconLoader2 } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MagangDetail {
  id: string
  user_id: string
  nama_siswa: string
  kelas: string
  jurusan: string
  dudi_id: string
  dudi_name?: string
  tanggal_mulai: string
  tanggal_selesai: string
  status: string
  created_at: string
}

export default function MagangDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [magang, setMagang] = React.useState<MagangDetail | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchMagangDetail = async () => {
      try {
        setLoading(true)
        
        // Decode URL parameter (handle encoded spaces and special characters)
        const decodedId = decodeURIComponent(String(params.id))
        console.log('[MagangDetail] Fetching data for:', decodedId)
        
        if (!supabaseBrowser) {
          setError('Database connection not available')
          return
        }
        
        // Fetch ALL magang data first to see what's available
        // Note: Database has nama_dudi directly, not a foreign key relation
        const { data: allData, error: allError } = await supabaseBrowser
          .from('magang')
          .select('*')
        
        console.log('[MagangDetail] All magang data:', allData)
        console.log('[MagangDetail] Looking for (decoded):', decodedId)
        
        if (allError) {
          console.error('[MagangDetail] Error fetching all data:', allError)
          setError('Gagal memuat data magang: ' + allError.message)
          return
        }

        if (!allData || allData.length === 0) {
          console.error('[MagangDetail] No data in magang table')
          setError('Tidak ada data magang di database')
          return
        }

        // Find matching record
        let data: any = null
        
        // Try to match by various fields (check both possible column names)
        // Handle both encoded and raw ID values
        const searchId = decodedId.toLowerCase().trim()
        data = allData.find((item: any) => {
          // Match by ID (numeric or string)
          if (String(item.id) === decodedId || String(item.id) === String(params.id)) {
            return true
          }
          // Match by user_id
          if (item.user_id && String(item.user_id).toLowerCase() === searchId) {
            return true
          }
          // Match by Siswa (nama siswa) - case insensitive
          if (item.Siswa && item.Siswa.toLowerCase().trim() === searchId) {
            return true
          }
          // Match by nama_siswa - case insensitive
          if (item.nama_siswa && item.nama_siswa.toLowerCase().trim() === searchId) {
            return true
          }
          return false
        })

        if (!data && allData.length > 0) {
          // If still not found but we have data, use the first record for testing
          console.warn('[MagangDetail] Exact match not found, using first record for testing')
          data = allData[0]
        }

        if (!data) {
          console.error('[MagangDetail] No matching data found')
          setError('Data magang tidak ditemukan')
          return
        }

        console.log('[MagangDetail] Found data:', data)

        // Transform data (match with actual database columns)
        const magangData: MagangDetail = {
          id: data.id,
          user_id: data.user_id || data.Siswa,
          nama_siswa: data.Siswa || data.nama_siswa || data.user_id || 'Siswa',
          kelas: data.kelas || '-',
          jurusan: data.jurusan || '-',
          dudi_id: data.dudi_id,
          dudi_name: data.nama_dudi || '-',  // ← Direct column, not foreign key!
          tanggal_mulai: data.tanggal_mulai || new Date().toISOString(),
          tanggal_selesai: data.tanggal_selesai || new Date().toISOString(),
          status: data.status || 'Aktif',
          created_at: data.created_at || new Date().toISOString()
        }

        console.log('[MagangDetail] Transformed data:', magangData)

        setMagang(magangData)
        setError(null)
      } catch (err) {
        console.error('Error:', err)
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchMagangDetail()
    }
  }, [params.id])

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'disetujui' || statusLower === 'approved' || statusLower === 'aktif') {
      return <Badge className="bg-green-500 hover:bg-green-600"><IconCheck className="w-3 h-3 mr-1" />Disetujui</Badge>
    }
    if (statusLower === 'ditolak' || statusLower === 'rejected') {
      return <Badge className="bg-red-500 hover:bg-red-600"><IconX className="w-3 h-3 mr-1" />Ditolak</Badge>
    }
    return <Badge className="bg-yellow-500 hover:bg-yellow-600"><IconClock className="w-3 h-3 mr-1" />Pending</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <IconLoader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data magang...</p>
        </div>
      </div>
    )
  }

  if (error || !magang) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <IconX className="w-5 h-5" />
              Data Tidak Ditemukan
            </CardTitle>
            <CardDescription>
              {error || 'Data magang tidak dapat dimuat'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="w-full"
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
          >
            <IconArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Detail Data Magang</h1>
            <p className="text-xs sm:text-sm text-gray-600">Informasi lengkap data magang siswa</p>
          </div>
        </div>

        {/* Main Card - Clean Layout */}
        <Card className="shadow-lg border-gray-200">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Info Grid - Clean & Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Nama */}
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50/50 border border-blue-100 rounded-xl hover:border-blue-300 transition-all">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconUser className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Nama:</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{magang.nama_siswa}</p>
                </div>
              </div>

              {/* Kelas */}
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50/50 border border-blue-100 rounded-xl hover:border-blue-300 transition-all">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconSchool className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Kelas:</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{magang.kelas}</p>
                </div>
              </div>

              {/* Jurusan */}
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50/50 border border-blue-100 rounded-xl hover:border-blue-300 transition-all">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Jurusan:</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{magang.jurusan}</p>
                </div>
              </div>

              {/* DUDI */}
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50/50 border border-blue-100 rounded-xl hover:border-blue-300 transition-all">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconBuilding className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-1">DUDI:</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{magang.dudi_name}</p>
                </div>
              </div>
            </div>

            {/* Periode - Full Width */}
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <IconCalendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Periode:</p>
                <p className="text-sm sm:text-base font-bold text-gray-900 break-words">
                  {formatDate(magang.tanggal_mulai)} - {formatDate(magang.tanggal_selesai)}
                </p>
              </div>
            </div>

            {/* Status - Clean, No Duplicate Badge */}
            <div className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                  <IconClock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status:</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{magang.status}</p>
                </div>
              </div>
              {getStatusBadge(magang.status)}
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>Data Magang SMK Brantas Karangkates</p>
              <p className="text-xs mt-1">© 2024 Management Magang</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
