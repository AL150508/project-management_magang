/**
 * REFACTORED: Dashboard Section - DUDI Aktif
 * 
 * File: src/components/dashboard/sections/dudi-aktif.tsx
 * 
 * SEARCHABLE COMMENTS:
 * - REFACTORED_DASHBOARD_SECTION: Komponen section untuk menampilkan DUDI aktif
 * - DASHBOARD_DUDI_AKTIF: Menampilkan daftar DUDI yang aktif dengan jumlah siswa
 * - DASHBOARD_DUDI_CARD: Card layout untuk informasi DUDI
 * - DASHBOARD_DUDI_INFO: Informasi detail DUDI (alamat, telepon, industri)
 * 
 * FUNGSI:
 * - Menampilkan daftar DUDI yang aktif
 * - Menampilkan jumlah siswa magang per DUDI
 * - Informasi kontak dan alamat DUDI
 * - Badge untuk jumlah siswa
 */

import { IconBuilding, IconMapPin, IconPhone } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type DudiItem = {
  id: string | number
  name: string
  address?: string
  phone?: string
  industry?: string
  count?: number
}

export function SectionDudiAktif({ items }: { items: DudiItem[] }) {
  return (
    <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <IconBuilding className="size-5 text-blue-600" />
            DUDI Aktif
          </CardTitle>
          <CardDescription>Perusahaan dan jumlah siswa magang</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((dudi) => (
              <div key={dudi.id} className="rounded-xl border border-blue-100/50 bg-white/50 p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{dudi.name}</h3>
                    {dudi.industry && (
                      <p className="text-sm text-slate-600 mt-1">{dudi.industry}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      {dudi.address && (
                        <div className="flex items-center gap-1">
                          <IconMapPin className="size-3" />
                          {dudi.address}
                        </div>
                      )}
                      {dudi.phone && (
                        <div className="flex items-center gap-1">
                          <IconPhone className="size-3" />
                          {dudi.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  {!!dudi.count && (
                    <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50">
                      {dudi.count} siswa
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
  )
}
