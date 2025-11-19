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
        console.log('[MagangDetail] Fetching data for:', params.id)
        
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
        console.log('[MagangDetail] Looking for:', params.id)
        
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
        data = allData.find((item: any) => 
          item.id === params.id ||
          item.user_id === params.id ||
          (item.Siswa && item.Siswa.toLowerCase() === (params.id as string).toLowerCase()) ||
          (item.nama_siswa && item.nama_siswa.toLowerCase() === (params.id as string).toLowerCase())
        )

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="flex-shrink-0"
          >
            <IconArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Data Magang</h1>
            <p className="text-sm text-gray-600">Informasi lengkap data magang siswa</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">{magang.nama_siswa}</CardTitle>
                <CardDescription className="text-blue-100">
                  {magang.kelas} - {magang.jurusan}
                </CardDescription>
              </div>
              {getStatusBadge(magang.status)}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Info Grid - Cleaner Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Nama */}
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <IconUser className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Nama</p>
                  <p className="font-semibold text-gray-900 truncate">{magang.nama_siswa}</p>
                </div>
              </div>

              {/* Kelas */}
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <IconSchool className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Kelas</p>
                  <p className="font-semibold text-gray-900">{magang.kelas}</p>
                </div>
              </div>

              {/* Jurusan */}
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <IconMapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Jurusan</p>
                  <p className="font-semibold text-gray-900">{magang.jurusan}</p>
                </div>
              </div>

              {/* DUDI */}
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <IconBuilding className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">DUDI</p>
                  <p className="font-semibold text-gray-900 truncate">{magang.dudi_name}</p>
                </div>
              </div>
            </div>

            {/* Periode - Full Width */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <IconCalendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-700 font-medium mb-1">Periode Magang</p>
                <p className="text-base font-bold text-gray-900">
                  {formatDate(magang.tanggal_mulai)} - {formatDate(magang.tanggal_selesai)}
                </p>
              </div>
            </div>

            {/* Status - Removed duplicate badge, cleaner display */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <IconClock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Status Magang</p>
                  <p className="text-sm font-semibold text-gray-900">{magang.status}</p>
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
