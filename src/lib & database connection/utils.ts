import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

// Utility function untuk menggabungkan CSS classes dengan aman
// Menggunakan clsx untuk conditional classes dan twMerge untuk menghindari konflik Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)) // Gabungkan dan merge classes dengan benar
}

// ===== TOAST NOTIFICATION UTILITIES =====

// Standard toast confirmation dengan action buttons
export const showConfirmation = ({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Ya",
  cancelLabel = "Batal",
  duration = 5000
}: {
  message: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  duration?: number
}) => {
  toast(message, {
    action: {
      label: confirmLabel,
      onClick: async () => {
        try {
          await onConfirm()
        } catch (error) {
          console.error("Error in confirmation action:", error)
          showError("Terjadi kesalahan saat memproses permintaan")
        }
      }
    },
    cancel: {
      label: cancelLabel,
      onClick: () => {
        onCancel?.()
        showInfo("Aksi dibatalkan")
      }
    },
    duration
  })
}

// Standard success toast
export const showSuccess = (message: string) => {
  toast.success(message)
}

// Standard error toast
export const showError = (message: string, details?: string) => {
  const fullMessage = details ? `${message} (${details})` : message
  toast.error(fullMessage)
}

// Standard info toast
export const showInfo = (message: string) => {
  toast.info(message)
}

// Standard warning toast
export const showWarning = (message: string) => {
  toast.warning(message)
}

// Loading toast with promise
export const showLoadingToast = async <T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error: string
  }
): Promise<T> => {
  const toastResult = toast.promise(promise, messages)
  return toastResult.unwrap()
}

// ===== GEOCODING HELPERS =====

interface GeocodeResult {
  lat: string
  lon: string
  display_name: string
  place_id: number
  importance: number
}

interface Coordinates {
  lat: number
  lon: number
}

/**
 * Mengubah alamat menjadi koordinat menggunakan API Nominatim
 * @param alamat - Alamat yang akan di-geocode
 * @returns Promise<Coordinates | null> - Koordinat atau null jika tidak ditemukan
 */
export async function getCoordinates(alamat: string): Promise<Coordinates | null> {
  try {
    // Validasi input
    if (!alamat || alamat.trim().length < 3) {
      console.warn('Alamat terlalu pendek untuk geocoding:', alamat)
      return null
    }

    // Bersihkan alamat
    const cleanAddress = alamat.trim()
    
    // Panggil API Nominatim dengan parameter yang dioptimalkan untuk Indonesia
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json` +
      `&q=${encodeURIComponent(cleanAddress)}` +
      `&limit=1` +
      `&countrycodes=id` + // Batasi ke Indonesia
      `&addressdetails=1` +
      `&dedupe=1`, // Hapus duplikat
      {
        headers: {
          'User-Agent': 'Magang Portal App/1.0 (Contact: admin@magangportal.com)'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: GeocodeResult[] = await response.json()
    
    if (!data || data.length === 0) {
      console.warn('Tidak ada hasil geocoding untuk alamat:', alamat)
      return null
    }

    const result = data[0]
    const coordinates = {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon)
    }

    // Validasi koordinat (pastikan dalam batas Indonesia)
    if (
      coordinates.lat < -11 || coordinates.lat > 6 || // Latitude Indonesia: -11° to 6°
      coordinates.lon < 95 || coordinates.lon > 141    // Longitude Indonesia: 95° to 141°
    ) {
      console.warn('Koordinat di luar batas Indonesia:', coordinates, 'untuk alamat:', alamat)
      return null
    }

    console.log('Geocoding berhasil:', {
      alamat: cleanAddress,
      coordinates,
      display_name: result.display_name
    })

    return coordinates
  } catch (error) {
    console.error('Error dalam geocoding:', error, 'untuk alamat:', alamat)
    return null
  }
}

/**
 * Validasi apakah koordinat valid untuk Indonesia
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns boolean - True jika koordinat valid
 */
export function isValidIndonesianCoordinates(lat: number, lon: number): boolean {
  return (
    lat >= -11 && lat <= 6 &&    // Latitude Indonesia
    lon >= 95 && lon <= 141      // Longitude Indonesia
  )
}
