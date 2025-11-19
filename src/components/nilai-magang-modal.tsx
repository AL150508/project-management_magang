"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { sendPushToUser } from "@/lib & database connection/send-push"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconStar, IconUser, IconBuilding } from "@tabler/icons-react"
import { showSuccess, showError } from "@/lib & database connection/utils"

interface NilaiMagangModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  magangData?: {
    id: string | number
    namaSiswa: string
    namaPerusahaan: string
    periodeMulai: string
    periodeSelesai: string
    nilaiAkhir?: number
  }
  onSuccess?: () => void
}

export function NilaiMagangModal({ 
  open, 
  onOpenChange, 
  magangData, 
  onSuccess 
}: NilaiMagangModalProps) {
  const [nilai, setNilai] = React.useState("")
  const [catatan, setCatatan] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (magangData) {
      setNilai(magangData.nilaiAkhir?.toString() || "")
      setCatatan("")
    }
  }, [magangData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!magangData) return

    const nilaiNumber = parseInt(nilai)
    if (isNaN(nilaiNumber) || nilaiNumber < 0 || nilaiNumber > 100) {
      toast.error("Nilai harus berupa angka antara 0-100")
      return
    }

    setLoading(true)
    
    try {
      if (!supabaseBrowser) throw new Error("Supabase not configured")
      
      // Update nilai in magang table
      const { error } = await supabaseBrowser
        .from("magang")
        .update({ nilai: nilaiNumber })
        .eq("id", magangData.id)
      
      if (error) throw error
      
      // Get siswa user_id to send push notification
      const { data: siswaData } = await supabaseBrowser
        .from('users')
        .select('id')
        .eq('full_name', magangData.namaSiswa)
        .single()
      
      // Send push notification to siswa
      if (siswaData?.id) {
        sendPushToUser(siswaData.id, {
          title: '⭐ Nilai Magang Keluar',
          body: `Nilai magang Anda di ${magangData.namaPerusahaan}: ${nilaiNumber}/100`,
          url: '/magang'
        }).catch(err => console.error('Push notification error:', err))
      }
      
      toast.success("Nilai berhasil disimpan")
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setNilai("")
      setCatatan("")
    } catch (error) {
      console.error("Error saving nilai:", error)
      toast.error("Gagal menyimpan nilai")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setNilai("")
      setCatatan("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconStar className="size-5 text-yellow-500" />
            Berikan Nilai Magang
          </DialogTitle>
          <DialogDescription>
            Berikan penilaian untuk siswa yang telah menyelesaikan magang
          </DialogDescription>
        </DialogHeader>

        {magangData && (
          <div className="space-y-4">
            {/* Info Siswa */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <IconUser className="size-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Siswa:</span>
                <span className="text-sm text-gray-900">{magangData.namaSiswa}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <IconBuilding className="size-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Perusahaan:</span>
                <span className="text-sm text-gray-900">{magangData.namaPerusahaan}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Periode: {magangData.periodeMulai} - {magangData.periodeSelesai}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Nilai */}
              <div className="space-y-2">
                <Label htmlFor="nilai">Nilai Akhir (0-100)</Label>
                <Input
                  id="nilai"
                  type="number"
                  min="0"
                  max="100"
                  value={nilai}
                  onChange={(e) => setNilai(e.target.value)}
                  placeholder="Masukkan nilai (0-100)"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-500">
                  Nilai saat ini: {magangData.nilaiAkhir ? `${magangData.nilaiAkhir}` : "Belum dinilai"}
                </p>
              </div>

              {/* Input Catatan */}
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Berikan catatan atau feedback untuk siswa..."
                  rows={3}
                  disabled={loading}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Menyimpan..." : "Simpan Nilai"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
