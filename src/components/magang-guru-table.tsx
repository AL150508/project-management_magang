"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconUser, IconCheck, IconX, IconEye, IconSearch, IconEdit } from "@tabler/icons-react"
import { toast } from "sonner"

export type MagangGuruItem = {
  id: string | number
  nama_siswa: string
  email: string
  telepon: string
  alamat?: string
  motivasi: string
  pengalaman?: string
  nama_dudi: string
  bidang_usaha?: string
  status: "Pending" | "Disetujui" | "Ditolak"
  catatan_guru?: string
  tanggal_pendaftaran: string
  tanggal_persetujuan?: string
}

type MagangGuruTableProps = {
  onRefresh?: () => void
}

export function MagangGuruTable({ onRefresh }: MagangGuruTableProps) {
  const [data, setData] = React.useState<MagangGuruItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [selectedItem, setSelectedItem] = React.useState<MagangGuruItem | null>(null)
  const [showDetailModal, setShowDetailModal] = React.useState(false)
  const [showActionModal, setShowActionModal] = React.useState(false)
  const [actionType, setActionType] = React.useState<"approve" | "reject">("approve")
  const [catatanGuru, setCatatanGuru] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [editStatus, setEditStatus] = React.useState<"Pending" | "Disetujui" | "Ditolak">("Pending")

  const loadData = React.useCallback(async () => {
    try {
      if (!supabaseBrowser) return

      const { data: magangData, error } = await supabaseBrowser
        .from("magang_guru")
        .select("*")
        .order("tanggal_pendaftaran", { ascending: false })

      if (error) {
        console.error("Error loading magang guru data:", error)
        return
      }

      const formattedData: MagangGuruItem[] = magangData?.map((item: Record<string, unknown>) => ({
        id: item.id as string | number,
        nama_siswa: item.nama_siswa as string,
        email: item.email as string,
        telepon: item.telepon as string,
        alamat: item.alamat as string,
        motivasi: item.motivasi as string,
        pengalaman: item.pengalaman as string,
        nama_dudi: item.nama_dudi as string,
        bidang_usaha: item.bidang_usaha as string,
        status: (item.status === "Disetujui" || item.status === "Ditolak" || item.status === "Pending") 
          ? item.status as "Disetujui" | "Ditolak" | "Pending"
          : "Pending",
        catatan_guru: item.catatan_guru as string,
        tanggal_pendaftaran: new Date(item.tanggal_pendaftaran as string).toLocaleDateString("id-ID"),
        tanggal_persetujuan: item.tanggal_persetujuan ? new Date(item.tanggal_persetujuan as string).toLocaleDateString("id-ID") : undefined
      })) || []

      setData(formattedData)
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const filteredData = data.filter(item => {
    const matchesSearch = item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.nama_dudi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Menunggu</Badge>
      case "Disetujui":
        return <Badge variant="outline" className="border-green-500 text-green-700">Disetujui</Badge>
      case "Ditolak":
        return <Badge variant="outline" className="border-red-500 text-red-700">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleAction = (item: MagangGuruItem, type: "approve" | "reject") => {
    setSelectedItem(item)
    setActionType(type)
    setCatatanGuru("")
    setShowActionModal(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedItem) return

    setActionLoading(true)
    try {
      if (!supabaseBrowser) {
        toast.error("Database tidak tersedia")
        return
      }

      if (actionType === "approve") {
        // Move to magang table
        const { error: insertError } = await supabaseBrowser
          .from("magang")
          .insert({
            nama_siswa: selectedItem.nama_siswa,
            nama_dudi: selectedItem.nama_dudi,
            bidang_usaha: selectedItem.bidang_usaha,
            status: "Aktif",
            periode_mulai: new Date().toISOString().split('T')[0],
            periode_selesai: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 hari dari sekarang
          })

        if (insertError) {
          console.error("Error inserting to magang:", insertError)
          toast.error("Gagal menyetujui pendaftaran")
          return
        }

        // Update status in magang_guru
        const { error: updateError } = await supabaseBrowser
          .from("magang_guru")
          .update({
            status: "Disetujui",
            catatan_guru: catatanGuru,
            tanggal_persetujuan: new Date().toISOString()
          })
          .eq("id", selectedItem.id)

        if (updateError) {
          console.error("Error updating status:", updateError)
          toast.error("Gagal mengupdate status")
          return
        }

        toast.success("Pendaftaran disetujui dan data dipindah ke tabel magang")
      } else {
        // Reject
        const { error } = await supabaseBrowser
          .from("magang_guru")
          .update({
            status: "Ditolak",
            catatan_guru: catatanGuru,
            tanggal_persetujuan: new Date().toISOString()
          })
          .eq("id", selectedItem.id)

        if (error) {
          console.error("Error rejecting:", error)
          toast.error("Gagal menolak pendaftaran")
          return
        }

        toast.success("Pendaftaran ditolak")
      }

      setShowActionModal(false)
      loadData()
      onRefresh?.()

    } catch (err) {
      console.error("Error processing action:", err)
      toast.error("Terjadi kesalahan")
    } finally {
      setActionLoading(false)
    }
  }

  const openEditModal = (item: MagangGuruItem) => {
    setSelectedItem(item)
    setEditStatus(item.status)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedItem) return
    setActionLoading(true)
    try {
      if (!supabaseBrowser) {
        toast.error("Database tidak tersedia")
        return
      }

      const payload: Record<string, unknown> = { status: editStatus }
      if (editStatus !== "Pending") {
        payload["tanggal_persetujuan"] = new Date().toISOString()
      }

      const { error } = await supabaseBrowser
        .from("magang_guru")
        .update(payload)
        .eq("id", selectedItem.id)

      if (error) {
        console.error("Error updating status:", error)
        toast.error("Gagal menyimpan perubahan status")
        return
      }

      toast.success("Status pendaftaran berhasil diperbarui")
      setShowEditModal(false)
      loadData()
      onRefresh?.()
    } catch (err) {
      console.error("Error saving edit:", err)
      toast.error("Terjadi kesalahan saat menyimpan")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Persetujuan Magang</CardTitle>
          <CardDescription>Menunggu persetujuan guru</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Persetujuan Magang</CardTitle>
          <CardDescription>Kelola pendaftaran magang siswa</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari nama siswa, perusahaan, atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Pending">Menunggu</SelectItem>
                  <SelectItem value="Disetujui">Disetujui</SelectItem>
                  <SelectItem value="Ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Tidak ada data pendaftaran
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconUser className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{item.nama_siswa}</div>
                            <div className="text-sm text-gray-500">{item.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nama_dudi}</div>
                          <div className="text-sm text-gray-500">{item.bidang_usaha}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.tanggal_pendaftaran}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item)
                              setShowDetailModal(true)
                            }}
                          >
                            <IconEye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                          {item.status === "Pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(item, "approve")}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <IconCheck className="w-4 h-4 mr-1" />
                                Setujui
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(item, "reject")}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <IconX className="w-4 h-4 mr-1" />
                                Tolak
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(item)}
                            className="border-blue-200 hover:bg-blue-50"
                          >
                            <IconEdit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pendaftaran</DialogTitle>
            <DialogDescription>
              Informasi lengkap pendaftaran magang
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nama Siswa</Label>
                  <p className="text-sm text-gray-600">{selectedItem.nama_siswa}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedItem.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telepon</Label>
                  <p className="text-sm text-gray-600">{selectedItem.telepon}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Perusahaan</Label>
                  <p className="text-sm text-gray-600">{selectedItem.nama_dudi}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Alamat</Label>
                <p className="text-sm text-gray-600">{selectedItem.alamat || "Tidak diisi"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Motivasi</Label>
                <p className="text-sm text-gray-600">{selectedItem.motivasi}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Pengalaman</Label>
                <p className="text-sm text-gray-600">{selectedItem.pengalaman || "Tidak diisi"}</p>
              </div>
              {selectedItem.catatan_guru && (
                <div>
                  <Label className="text-sm font-medium">Catatan Guru</Label>
                  <p className="text-sm text-gray-600">{selectedItem.catatan_guru}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Setujui Pendaftaran" : "Tolak Pendaftaran"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "Pendaftaran akan disetujui dan data dipindah ke tabel magang"
                : "Pendaftaran akan ditolak"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="catatan">Catatan Guru</Label>
              <Textarea
                id="catatan"
                placeholder={actionType === "approve" 
                  ? "Catatan untuk siswa (opsional)"
                  : "Alasan penolakan (wajib)"
                }
                value={catatanGuru}
                onChange={(e) => setCatatanGuru(e.target.value)}
                rows={3}
                required={actionType === "reject"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>
              Batal
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={actionLoading || (actionType === "reject" && !catatanGuru.trim())}
              className={actionType === "approve" 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionLoading ? "Memproses..." : (actionType === "approve" ? "Setujui" : "Tolak")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status Pendaftaran</DialogTitle>
            <DialogDescription>Ubah status tanpa memindahkan data ke tabel magang</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Siswa</Label>
              <p className="text-sm text-gray-600">{selectedItem?.nama_siswa}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusEdit">Status</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as typeof editStatus)}>
                <SelectTrigger id="statusEdit">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Disetujui">Disetujui</SelectItem>
                  <SelectItem value="Ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Batal</Button>
            <Button onClick={handleSaveEdit} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
              {actionLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
