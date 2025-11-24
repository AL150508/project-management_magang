"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { IconMapPin, IconBuilding, IconLoader2, IconUser } from "@tabler/icons-react"
import { cn } from "@/lib & database connection/utils"

// Dynamic import untuk Leaflet components (SSR safe)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface DudiMapViewerProps {
  className?: string
  onMarkerClick?: (dudiId: string) => void
}

interface DudiItem {
  id: string | number
  nama_perusahaan: string
  bidang_usaha: string
  alamat: string
  pic: string
  kuota_magang: number
  kuota_terisi: number
  status?: "Tersedia" | "Penuh" | "Menunggu"
  latitude?: number
  longitude?: number
}

// Warna konsisten untuk setiap perusahaan (sama dengan cards)
const COMPANY_COLORS = {
  1: { bg: "bg-blue-100", icon: "text-blue-600", name: "blue", hex: "#2563eb" },
  2: { bg: "bg-green-100", icon: "text-green-600", name: "green", hex: "#16a34a" },
  3: { bg: "bg-purple-100", icon: "text-purple-600", name: "purple", hex: "#9333ea" },
  4: { bg: "bg-orange-100", icon: "text-orange-600", name: "orange", hex: "#ea580c" },
  5: { bg: "bg-red-100", icon: "text-red-600", name: "red", hex: "#dc2626" },
}

// Default center: Malang, Jawa Timur
const DEFAULT_CENTER: [number, number] = [-7.983908, 112.621391]
const DEFAULT_ZOOM = 11

export function DudiMapViewer({ className, onMarkerClick }: DudiMapViewerProps) {
  const [dudiList, setDudiList] = React.useState<DudiItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isMounted, setIsMounted] = React.useState(false)
  const [mapCenter, setMapCenter] = React.useState<[number, number]>(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = React.useState(DEFAULT_ZOOM)

  // Load data from database (same as dudi-cards)
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      console.log("Loading DUDI data for map...")
      
      // Import supabase
      const { supabaseBrowser } = await import("@/lib & database connection/supabase-browser")
      
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

      console.log("DUDI data loaded for map:", dudiData)
      
      // Ambil data siswa magang untuk menghitung kuota terisi
      const { data: magangData } = await supabaseBrowser
        .from("magang")
        .select("nama_dudi, status")
        .eq("status", "Aktif")
      
      // Hitung kuota terisi per DUDI
      const kuotaTerisi = (magangData || []).reduce((acc: Record<string, number>, item: any) => {
        const dudiName = item.nama_dudi
        if (dudiName) {
          acc[dudiName] = (acc[dudiName] || 0) + 1
        }
        return acc
      }, {})
      
      // Transform data dan filter hanya yang memiliki koordinat valid
      const transformedData = (dudiData || [])
        .map((item: any) => {
          const kuotaMagang = item.jumlah_siswa || 0
          const kuotaTerisiCount = kuotaTerisi[item.nama_perusahaan] || 0
          
          return {
            ...item,
            // Map database fields to map requirements
            pic: item.penanggung_jawab || "Tidak ada PIC",
            bidang_usaha: item.bidang_usaha || "Belum ditentukan",
            kuota_magang: kuotaMagang,
            kuota_terisi: kuotaTerisiCount, // Data real dari tabel magang
            status: kuotaTerisiCount >= kuotaMagang && kuotaMagang > 0 ? "Penuh" : 
                    kuotaMagang > 0 ? "Tersedia" : "Menunggu",
            latitude: item.latitude,
            longitude: item.longitude
          }
        })
      
      setDudiList(transformedData)
      
      console.log(`Filtered DUDI with valid coordinates: ${transformedData.length} out of ${dudiData?.length || 0} total DUDI`)
      
    } catch (error) {
      console.error("Error loading DUDI data for map:", error)
      // Set empty array on error so map still renders
      setDudiList([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const getCompanyColor = (id: string | number) => {
    const numId = Number(id)
    return COMPANY_COLORS[numId as keyof typeof COMPANY_COLORS] || COMPANY_COLORS[1]
  }

  const getProgressPercentage = (terisi: number, kuota: number) => {
    if (kuota === 0) return 0
    return Math.round((terisi / kuota) * 100)
  }

  // Handle marker click untuk scroll ke DUDI card
  const handleMarkerClick = React.useCallback((dudiId: string | number) => {
    if (onMarkerClick) {
      onMarkerClick(String(dudiId))
    } else {
      // Default behavior: scroll ke element dengan id
      const element = document.getElementById(`dudi-card-${dudiId}`)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        // Highlight effect
        element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
        }, 2000)
      }
    }
  }, [onMarkerClick])

  // Effect untuk setup leaflet dan mount component
  React.useEffect(() => {
    const initializeMap = async () => {
      if (typeof window !== 'undefined') {
        // Fix leaflet default icons
        const L = await import('leaflet')
        
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
        
        setIsMounted(true)
      }
    }
    
    initializeMap()
  }, [])

  // Custom marker icon dengan warna
  const createCustomIcon = (color: string) => {
    if (typeof window === 'undefined') return null
    
    const L = require('leaflet')
    
    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">🏢</div>
      </div>
    `
    
    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [25, 25],
      iconAnchor: [12, 25],
      popupAnchor: [0, -25]
    })
  }

  if (!isMounted || isLoading) {
    return (
      <div className={cn("w-full mb-6", className)}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Peta Lokasi DUDI</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Klik marker untuk melihat detail perusahaan</p>
          </div>
          <div className="h-[280px] md:h-[320px] lg:h-[380px] flex items-center justify-center bg-gray-50">
            <div className="flex items-center gap-2 text-gray-500">
              <IconLoader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Memuat peta lokasi DUDI...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (dudiList.length === 0) {
    return (
      <div className={cn("w-full mb-6", className)}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Peta Lokasi DUDI</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Klik marker untuk melihat detail perusahaan</p>
          </div>
          <div className="h-[280px] md:h-[320px] lg:h-[380px] flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <IconBuilding className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Belum ada data lokasi DUDI</p>
              <p className="text-xs mt-1">Lokasi akan muncul setelah DUDI menambahkan koordinat</p>
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
                <IconMapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Peta Lokasi DUDI</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Klik marker untuk melihat detail perusahaan</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{dudiList.length} Lokasi</p>
              <p className="text-xs text-gray-500">DUDI Tersedia</p>
            </div>
          </div>
        </div>
        
        <div className="h-[280px] md:h-[320px] lg:h-[380px] relative map-container-responsive">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            zoomControl={true}
            scrollWheelZoom={true}
            className="leaflet-map-responsive"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {dudiList.map((dudi) => {
              if (!dudi.latitude || !dudi.longitude) return null
              
              const colors = getCompanyColor(dudi.id)
              const customIcon = createCustomIcon(colors.hex)
              
              return (
                <Marker
                  key={dudi.id}
                  position={[dudi.latitude, dudi.longitude]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleMarkerClick(dudi.id)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <IconBuilding className={`h-4 w-4 ${colors.icon}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                            {dudi.nama_perusahaan}
                          </h4>
                          <p className="text-xs text-gray-600">{dudi.bidang_usaha}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 mb-2">
                        <IconMapPin className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {dudi.alamat.length > 80 
                            ? `${dudi.alamat.substring(0, 80)}...` 
                            : dudi.alamat
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-2 mb-3">
                        <IconUser className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">PIC: {dudi.pic}</p>
                      </div>
                      
                      {/* Kuota Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Kuota Magang</span>
                          <span className="font-medium text-gray-900">
                            {dudi.kuota_terisi}/{dudi.kuota_magang}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${colors.icon.replace('text-', 'bg-')}`}
                            style={{ width: `${getProgressPercentage(dudi.kuota_terisi, dudi.kuota_magang)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {dudi.kuota_magang - dudi.kuota_terisi} slot tersisa • {getProgressPercentage(dudi.kuota_terisi, dudi.kuota_magang)}% terisi
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleMarkerClick(dudi.id)}
                        className={`w-full text-xs text-white px-3 py-1.5 rounded transition-colors ${colors.icon.replace('text-', 'bg-')} hover:${colors.icon.replace('text-', 'bg-')}/90`}
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}