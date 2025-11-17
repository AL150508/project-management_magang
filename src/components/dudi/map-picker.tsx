"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Label } from "@/components/ui/label"
import { IconMapPin, IconLoader2 } from "@tabler/icons-react"
import { cn } from "@/lib & database connection/utils"

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

const MapEventHandler = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMapEvents } = mod
    return function MapEventHandlerComponent({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
      const map = useMapEvents({
        click: (e) => {
          const { lat, lng } = e.latlng
          onLocationChange(lat, lng)
        }
      })
      return null
    }
  }),
  { ssr: false }
)

interface MapPickerProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
  className?: string
  height?: number
  label?: string
  disabled?: boolean
}

// Default center: Jawa Timur
const DEFAULT_CENTER: [number, number] = [-7.9666, 112.6326]
const DEFAULT_ZOOM = 10

// Component untuk draggable marker
function DraggableMarker({ 
  position, 
  onLocationChange 
}: { 
  position: [number, number]
  onLocationChange: (lat: number, lng: number) => void 
}) {
  const markerRef = React.useRef<any>(null)
  
  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const { lat, lng } = marker.getLatLng()
          onLocationChange(lat, lng)
        }
      },
    }),
    [onLocationChange]
  )

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  )
}

export function MapPicker({
  latitude,
  longitude,
  onLocationChange,
  className,
  height = 280,
  label = "Lokasi pada Peta",
  disabled = false
}: MapPickerProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const [mapKey, setMapKey] = React.useState(0)
  
  // Position untuk marker
  const position: [number, number] = React.useMemo(() => {
    // Jika ada koordinat yang valid, gunakan itu
    if (latitude && longitude && latitude !== 0 && longitude !== 0) {
      return [latitude, longitude]
    }
    // Jika tidak, gunakan default center
    return DEFAULT_CENTER
  }, [latitude, longitude])

  // Handle location change
  const handleLocationChange = React.useCallback((lat: number, lng: number) => {
    if (!disabled) {
      onLocationChange(lat, lng)
    }
  }, [onLocationChange, disabled])

  // Effect untuk memastikan component sudah mounted dan setup leaflet
  React.useEffect(() => {
    // Fix leaflet default icons
    const fixLeafletIcons = async () => {
      const L = await import('leaflet')
      
      // Delete existing icon URLs
      delete (L.Icon.Default.prototype as any)._getIconUrl
      
      // Set new icon URLs
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
    }
    
    fixLeafletIcons().then(() => {
      setIsMounted(true)
    })
  }, [])

  // Effect untuk re-render map ketika position berubah significantly
  React.useEffect(() => {
    if (isMounted) {
      setMapKey(prev => prev + 1)
    }
  }, [Math.round(latitude * 1000), Math.round(longitude * 1000), isMounted])

  if (!isMounted) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        <div className="h-[260px] flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500">
            <IconLoader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Memuat peta...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      
      <div className="relative">
        <div 
          className={cn(
            "rounded-lg border border-gray-200 overflow-hidden h-[260px]",
            disabled && "opacity-50 pointer-events-none"
          )}
        >
          <MapContainer
            key={mapKey}
            center={position}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Event handler untuk click pada map */}
            <MapEventHandler onLocationChange={handleLocationChange} />
            
            {/* Draggable marker */}
            <DraggableMarker 
              position={position} 
              onLocationChange={handleLocationChange} 
            />
          </MapContainer>
        </div>
        
        {/* Overlay untuk disabled state */}
        {disabled && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
            <p className="text-sm text-gray-500">Peta tidak dapat diubah</p>
          </div>
        )}
      </div>
      
      {/* Koordinat info dan helper text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <IconMapPin className="h-3 w-3" />
          <span>
            {latitude && longitude && latitude !== 0 && longitude !== 0
              ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              : "Belum ada lokasi dipilih"
            }
          </span>
        </div>
        <span>Klik atau seret marker untuk mengubah lokasi</span>
      </div>
    </div>
  )
}