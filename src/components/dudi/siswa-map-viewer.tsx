"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { IconMapPin, IconLoader2, IconUser, IconBuilding } from "@tabler/icons-react"
import { cn } from "@/lib & database connection/utils"

// Helper: id DOM selalu string
const toId = (val: string | number): string => String(val)

// Dynamic import untuk React Leaflet components dengan SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// Helper untuk membuat badge icon dengan jumlah siswa
const makeCountIcon = async (count: number) => {
  const L = await import('leaflet')
  const html = `
    <div style="
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px; height: 34px;
      border-radius: 9999px;
      background: #16a34a; /* green-600 */
      color:#fff; font-weight:600; font-size:12px;
      box-shadow: 0 2px 6px rgba(0,0,0,.25);
    ">
      ${count}
    </div>
  `
  return L.divIcon({
    html,
    className: 'cluster-badge',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -28],
  })
}

// Komponen ClusterMarker terpisah untuk menghindari hooks error
interface ClusterMarkerProps {
  position: [number, number]
  siswaGroup: SiswaMagang[]
  onMarkerClick: (siswaId: string) => void
}

function ClusterMarker({ position, siswaGroup, onMarkerClick }: ClusterMarkerProps) {
  const [icon, setIcon] = React.useState<any>(null)
  const first = siswaGroup[0]

  React.useEffect(() => {
    makeCountIcon(siswaGroup.length).then(setIcon)
  }, [siswaGroup.length])

  if (!icon) return null

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => {
          // Klik marker default: scroll ke siswa pertama
          onMarkerClick(toId(first.id))
        },
      }}
    >
      <Popup>
        <div className="space-y-2 min-w-[240px]">
          <div className="text-sm font-semibold text-gray-900">
            {first.dudi.nama_perusahaan}
          </div>
          <div className="text-xs text-gray-600">
            {first.dudi.alamat}
          </div>

          <div className="border-t border-gray-100 pt-2">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Siswa di lokasi ini ({siswaGroup.length})
            </div>
            <ul className="space-y-1 max-h-[160px] overflow-auto pr-1">
              {siswaGroup.map(s => (
                <li key={toId(s.id)} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-800">
                    {s.Siswa || s.nama_siswa} <span className="text-gray-500">• {s.kelas || s.Kelas} {s.jurusan || s.Jurusan}</span>
                  </span>
                  <button
                    onClick={() => onMarkerClick(toId(s.id))}
                    className="text-[11px] px-2 py-0.5 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Lihat
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

interface SiswaMapViewerProps {
  className?: string
  onMarkerClick?: (siswaId: string) => void
}

interface SiswaMagang {
  id: string | number
  Siswa: string
  kelas: string
  jurusan: string
  dudi_id: string | number
  periode_mulai: string
  periode_selesai: string
  status: string
  dudi: {
    id: string | number
    nama_perusahaan: string
    alamat: string
    latitude: number
    longitude: number
  }
}

// Default center: Jawa Timur
const DEFAULT_CENTER: [number, number] = [-7.9666, 112.6326]
const DEFAULT_ZOOM = 10

export function SiswaMapViewer({ className, onMarkerClick }: SiswaMapViewerProps) {
  const [siswaList, setSiswaList] = React.useState<SiswaMagang[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isMounted, setIsMounted] = React.useState(false)
  const [mapCenter, setMapCenter] = React.useState<[number, number]>(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = React.useState(DEFAULT_ZOOM)

  // Fetch siswa magang aktif dengan join DUDI
  const fetchSiswaData = React.useCallback(async () => {
    try {
      if (!supabaseBrowser) {
        console.error('Supabase client not initialized')
        return
      }

      const { data, error } = await supabaseBrowser
        .from('magang')
        .select(`
          *,
          dudi (
            id,
            nama_perusahaan,
            alamat,
            latitude,
            longitude
          )
        `)
        .eq('status', 'Aktif')
        .not('dudi.latitude', 'is', null)
        .not('dudi.longitude', 'is', null)
        .neq('dudi.latitude', 0)
        .neq('dudi.longitude', 0)

      if (error) {
        console.error('Error fetching siswa magang data:', error)
        return
      }

      if (data && data.length > 0) {
        // Filter data yang memiliki DUDI dengan koordinat valid
        const validSiswa = data.filter(siswa => 
          siswa.dudi && 
          siswa.dudi.latitude && 
          siswa.dudi.longitude
        ) as SiswaMagang[]
        
        setSiswaList(validSiswa)
        
        if (validSiswa.length > 0) {
          // Calculate bounds untuk fit semua marker
          const validCoords = validSiswa.map(siswa => 
            [siswa.dudi.latitude, siswa.dudi.longitude] as [number, number]
          )
          
          // Calculate center dari semua koordinat
          const avgLat = validCoords.reduce((sum, coord) => sum + coord[0], 0) / validCoords.length
          const avgLng = validCoords.reduce((sum, coord) => sum + coord[1], 0) / validCoords.length
          setMapCenter([avgLat, avgLng])
          
          // Adjust zoom berdasarkan spread koordinat
          const latSpread = Math.max(...validCoords.map(c => c[0])) - Math.min(...validCoords.map(c => c[0]))
          const lngSpread = Math.max(...validCoords.map(c => c[1])) - Math.min(...validCoords.map(c => c[1]))
          const maxSpread = Math.max(latSpread, lngSpread)
          
          if (maxSpread > 2) setMapZoom(8)
          else if (maxSpread > 1) setMapZoom(9)
          else if (maxSpread > 0.5) setMapZoom(10)
          else setMapZoom(11)
        }
      }
    } catch (error) {
      console.error('Error in fetchSiswaData:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle marker click untuk scroll ke tabel row siswa
  const handleMarkerClick = React.useCallback((siswaId: string) => {
    if (onMarkerClick) {
      onMarkerClick(siswaId)
    } else {
      // Default behavior: scroll ke element dengan id
      const element = document.getElementById(`siswa-row-${siswaId}`)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        // Highlight effect
        element.classList.add('bg-blue-50', 'ring-2', 'ring-blue-500', 'ring-opacity-50')
        setTimeout(() => {
          element.classList.remove('bg-blue-50', 'ring-2', 'ring-blue-500', 'ring-opacity-50')
        }, 2000)
      }
    }
  }, [onMarkerClick])

  // Create custom icon untuk siswa (hijau/cyan)
  const createSiswaIcon = React.useCallback(async () => {
    const L = await import('leaflet')
    
    return new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }, [])

  // Effect untuk setup leaflet dan fetch data
  React.useEffect(() => {
    const initializeMap = async () => {
      // Fix leaflet default icons
      const L = await import('leaflet')
      
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      
      setIsMounted(true)
      await fetchSiswaData()
    }
    
    initializeMap()
  }, [fetchSiswaData])

  // Group siswa berdasarkan DUDI untuk clustering
  const groupedSiswa = React.useMemo(() => {
    const groups: { [key: string]: SiswaMagang[] } = {}
    siswaList.forEach(siswa => {
      const key = `${siswa.dudi.latitude}-${siswa.dudi.longitude}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(siswa)
    })
    return groups
  }, [siswaList])

  if (!isMounted || isLoading) {
    return (
      <div className={cn("w-full mb-6", className)}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Peta Lokasi Siswa Magang</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Klik marker untuk melihat detail siswa</p>
          </div>
          <div className="h-[280px] sm:h-[320px] lg:h-[380px] flex items-center justify-center bg-gray-50">
            <div className="flex items-center gap-2 text-gray-500">
              <IconLoader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Memuat peta lokasi siswa...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (siswaList.length === 0) {
    return (
      <div className={cn("w-full mb-6", className)}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Peta Lokasi Siswa Magang</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Klik marker untuk melihat detail siswa</p>
          </div>
          <div className="h-[280px] sm:h-[320px] lg:h-[380px] flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <IconUser className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Belum ada siswa magang aktif</p>
              <p className="text-xs mt-1">Siswa akan muncul setelah ditempatkan di DUDI</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full mb-6", className)}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <IconMapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Peta Lokasi Siswa Magang</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Klik marker untuk melihat detail siswa</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{siswaList.length} Siswa</p>
              <p className="text-xs text-gray-500">Sedang Magang</p>
            </div>
          </div>
        </div>
        
        <div className="h-[280px] sm:h-[320px] lg:h-[380px] relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {Object.entries(groupedSiswa).map(([key, siswaGroup]) => {
              const first = siswaGroup[0]
              const position: [number, number] = [first.dudi.latitude, first.dudi.longitude]

              return (
                <ClusterMarker
                  key={key}
                  position={position}
                  siswaGroup={siswaGroup}
                  onMarkerClick={handleMarkerClick}
                />
              )
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}