"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconBuilding, IconMail, IconMapPin, IconPhone, IconUsers } from "@tabler/icons-react"
import { DudiMapViewer } from "@/components/dudi/dudi-map-viewer"

type Dudi = {
  id: string | number
  name: string
  address?: string
  phone?: string
  email?: string
  industry?: string
  capacity?: number
  startDate?: string
  status?: string
}

export function DudiList() {
  const [data, setData] = React.useState<Dudi[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      setError(null)
      if (!supabaseBrowser) {
        setError("Supabase client not initialized")
        setData(null)
        return
      }

      const { data, error } = await supabaseBrowser
        .from("dudi")
        .select("id,name,address,phone,email,industry,capacity,startDate,status")
        .order("name", { ascending: true })
      if (!isMounted) return
      if (error) {
        setError(error.message)
        setData(null)
      } else {
        setData((data as unknown as Dudi[]) || [])
      }
      setLoading(false)
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBuilding className="size-5 text-blue-600" />
            Memuat DUDI...
          </CardTitle>
          <CardDescription>Mengambil data dari Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-blue-100/30 animate-pulse" />
            <div className="h-16 rounded-xl bg-blue-100/30 animate-pulse" />
            <div className="h-16 rounded-xl bg-blue-100/30 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl border border-red-200/60 bg-red-50/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-red-800">Gagal memuat data</CardTitle>
          <CardDescription className="text-red-700">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBuilding className="size-5 text-blue-600" />
            Daftar DUDI Partner
          </CardTitle>
          <CardDescription>Belum ada data DUDI</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totalCapacity = data.reduce((sum, d) => sum + (d.capacity ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardDescription className="text-blue-700/80">Total Partner</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{data.length}</CardTitle>
            </div>
            <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
              <IconBuilding className="size-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardDescription className="text-blue-700/80">Total Kapasitas</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{totalCapacity}</CardTitle>
            </div>
            <div className="bg-cyan-500/15 text-cyan-600 ring-1 ring-cyan-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
              <IconUsers className="size-5" />
            </div>
          </CardHeader>
        </Card>
        </div>
      </div>

      <Card className="rounded-2xl border border-blue-100/60 bg-white/70 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBuilding className="size-5 text-blue-600" />
            Daftar DUDI Partner
          </CardTitle>
          <CardDescription>Data dari Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((dudi) => (
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
                      {dudi.email && (
                        <div className="flex items-center gap-1">
                          <IconMail className="size-3" />
                          {dudi.email}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      {typeof dudi.capacity === "number" && (
                        <span>Kapasitas: {dudi.capacity} siswa</span>
                      )}
                      {dudi.startDate && <span>Bergabung: {dudi.startDate}</span>}
                    </div>
                  </div>
                  {dudi.status && (
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                      {dudi.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


