"use client"

import * as React from "react"
import { QRCodeSVG } from "qrcode.react"
import { toPng } from "html-to-image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconCopy, IconDownload, IconX, IconQrcode } from "@tabler/icons-react"
import { toast } from "sonner"

interface QrModalProps {
  id: string | number
  open: boolean
  onClose: () => void
  studentName?: string
  kelas?: string
  jurusan?: string
  dudi?: string
  periode?: string
  status?: string
}

export function QrModal({ 
  id, 
  open, 
  onClose, 
  studentName,
  kelas,
  jurusan,
  dudi,
  periode,
  status 
}: QrModalProps) {
  const [isDownloading, setIsDownloading] = React.useState(false)
  const qrRef = React.useRef<HTMLDivElement>(null)
  
  // Generate URL untuk QR Code
  // Encode ID untuk handle spasi dan special characters
  const qrUrl = React.useMemo(() => {
    const encodedId = encodeURIComponent(String(id))
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/magang/detail/${encodedId}`
    }
    return `https://localhost:3000/magang/detail/${encodedId}`
  }, [id])

  // Copy URL ke clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      toast.success("Link berhasil disalin ke clipboard")
    } catch (error) {
      console.error("Failed to copy URL:", error)
      toast.error("Gagal menyalin link")
    }
  }

  // Download QR Code sebagai WebP
  const handleDownloadQr = async () => {
    if (!qrRef.current) return
    
    setIsDownloading(true)
    try {
      const dataUrl = await toPng(qrRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 280,
        height: 280,
      })
      
      // Convert PNG to WebP (optional, fallback to PNG if WebP not supported)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = 280
        canvas.height = 280
        ctx?.drawImage(img, 0, 0, 280, 280)
        
        // Try WebP first, fallback to PNG
        let finalDataUrl: string
        let extension: string
        
        try {
          finalDataUrl = canvas.toDataURL('image/webp', 0.9)
          extension = 'webp'
        } catch {
          finalDataUrl = dataUrl
          extension = 'png'
        }
        
        // Create download link
        const link = document.createElement('a')
        link.download = `qr-magang-${studentName || id}.${extension}`
        link.href = finalDataUrl
        link.click()
        
        toast.success(`QR Code berhasil diunduh sebagai ${extension.toUpperCase()}`)
      }
      
      img.src = dataUrl
      
    } catch (error) {
      console.error("Failed to download QR:", error)
      toast.error("Gagal mengunduh QR Code")
    } finally {
      setIsDownloading(false)
    }
  }

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    if (open) {
      window.addEventListener("keydown", onKeyDown)
      return () => window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 flex size-7 sm:size-8 items-center justify-center rounded-lg flex-shrink-0">
              <IconQrcode className="size-3 sm:size-4" />
            </div>
            <span className="truncate">QR Code Data Magang</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {studentName ? `QR Code untuk data magang ${studentName}` : `QR Code untuk data magang siswa`}
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable Content with Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
          <div className="space-y-3 sm:space-y-4 pb-4">
            {/* Student Info */}
            {(studentName || kelas || jurusan || dudi) && (
              <div className="bg-blue-50/50 p-2 sm:p-3 rounded-lg space-y-1.5 sm:space-y-2">
                {studentName && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Nama:</span>
                    <span className="text-xs sm:text-sm font-medium text-right break-words">{studentName}</span>
                  </div>
                )}
                {kelas && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Kelas:</span>
                    <span className="text-xs sm:text-sm font-medium text-right">{kelas}</span>
                  </div>
                )}
                {jurusan && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Jurusan:</span>
                    <span className="text-xs sm:text-sm font-medium text-right">{jurusan}</span>
                  </div>
                )}
                {dudi && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">DUDI:</span>
                    <span className="text-xs sm:text-sm font-medium text-right break-words">{dudi}</span>
                  </div>
                )}
                {periode && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Periode:</span>
                    <span className="text-xs sm:text-sm font-medium text-right">{periode}</span>
                  </div>
                )}
                {status && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Status:</span>
                    <span className="text-xs sm:text-sm font-medium text-right">{status}</span>
                  </div>
                )}
              </div>
            )}
          
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div 
                ref={qrRef}
                className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <QRCodeSVG
                  value={qrUrl}
                  size={window.innerWidth < 640 ? 180 : 220} // Responsive size
                  level="M"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  className="w-full h-auto max-w-[180px] sm:max-w-[220px]"
                />
              </div>
            </div>
          
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="qr-url" className="text-xs sm:text-sm font-medium">
                Link Detail Magang
              </Label>
              <div className="flex gap-2">
                <Input
                  id="qr-url"
                  value={qrUrl}
                  readOnly
                  className="flex-1 text-xs sm:text-sm min-w-0"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="flex-shrink-0 h-9 w-9 p-0"
                >
                  <IconCopy className="size-3 sm:size-4" />
                </Button>
              </div>
            </div>
          
            {/* Instructions */}
            <div className="text-xs text-gray-500 bg-gray-50 p-2 sm:p-3 rounded-lg">
              <p className="font-medium mb-1">Cara menggunakan:</p>
              <ul className="space-y-0.5 sm:space-y-1">
                <li>• Scan QR Code dengan kamera smartphone</li>
                <li>• Atau salin link dan bagikan kepada yang membutuhkan</li>
                <li>• Link akan membuka halaman detail data magang siswa</li>
              </ul>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1"
          >
            <IconX className="size-3 sm:size-4 mr-2" />
            Tutup
          </Button>
          <Button
            onClick={handleDownloadQr}
            disabled={isDownloading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 !text-white disabled:!text-white order-1 sm:order-2"
          >
            <IconDownload className="size-3 sm:size-4 mr-2 text-white" />
            {isDownloading ? "Mengunduh..." : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}