"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconCalendar, IconClock, IconCheck, IconAlertCircle, IconTrendingUp } from "@tabler/icons-react"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { useAuth } from "@/context/auth-context"

interface StudentDashboardProps {
  userName: string
}

export function StudentDashboard({ userName }: StudentDashboardProps) {
  // Data dummy untuk dashboard siswa
  const { user } = useAuth()
  const [studentStats, setStudentStats] = React.useState({
    totalLogbook: 0,
    approvedLogbook: 0,
    pendingLogbook: 0,
    rejectedLogbook: 0,
    activeMagang: true,
    magangProgress: 0,
    nextDeadline: ""
  })

  const [recentActivities, setRecentActivities] = React.useState<Array<{id:number|string; type:string; title:string; time:string; status:"approved"|"progress"|"rejected"|"pending"}>>([])

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (!supabaseBrowser) return
        // Get logbook statistics with direct query
        let total = 0, approved = 0, rejected = 0, pending = 0
        
        const { data: allRows } = await supabaseBrowser
          .from('logbook')
          .select('status')
        type LogbookRow = { status?: string }
        const rows: LogbookRow[] = (allRows as LogbookRow[] | null) || []
        total = rows.length
        approved = rows.filter((r: LogbookRow) => (r.status || '') === 'Disetujui').length
        rejected = rows.filter((r: LogbookRow) => (r.status || '') === 'Ditolak').length
        pending = rows.filter((r: LogbookRow) => (r.status || '') === 'Belum Diverifikasi').length

        // Get recent activities with direct query
        type LatestRow = { id?: number | string; kegiatan?: string; tanggal?: string; status?: string }
        let recent: Array<{id:number|string; type:string; title:string; time:string; status:"approved"|"progress"|"rejected"|"pending"}> = []
        let nextDeadline = ''
        
        const { data: fallbackRows } = await supabaseBrowser
          .from('logbook')
          .select('id,kegiatan,status,tanggal')
            .order('created_at', { ascending: false })
            .limit(3)
        const recentRows: LatestRow[] = (fallbackRows as LatestRow[] | null) || []
        recent = recentRows.map((r: LatestRow, idx: number) => ({
          id: (r.id ?? idx) as number | string,
          type: 'logbook',
          title: r.kegiatan || 'Aktivitas logbook',
          time: r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '',
          status: (r.status === 'Disetujui') ? 'approved' : (r.status === 'Ditolak') ? 'rejected' : 'progress'
        }))
        const sortedDates = recentRows.map((r: LatestRow) => r.tanggal).filter(Boolean).sort() as string[]
        nextDeadline = sortedDates.slice(-1)[0] || ''

        const progress = total > 0 ? Math.min(100, Math.round((approved / total) * 100)) : 0

        if (!cancelled) {
          setStudentStats({
            totalLogbook: total,
            approvedLogbook: approved,
            pendingLogbook: pending,
            rejectedLogbook: rejected,
            activeMagang: true,
            magangProgress: progress,
            nextDeadline
          })
          setRecentActivities(recent)
        }
      } catch (e) {
        console.warn("StudentDashboard: load error", e)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?.fullName, userName])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <IconCheck className="h-4 w-4 text-green-600" />
      case "progress":
        return <IconTrendingUp className="h-4 w-4 text-blue-600" />
      case "rejected":
        return <IconAlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <IconClock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "progress":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          Selamat datang!
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Kelola kegiatan magang dan logbook harian Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="w-full min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardDescription className="text-blue-700/80">Total Logbook</CardDescription>
                  <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{studentStats.totalLogbook}</CardTitle>
                </div>
                <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
                  <IconCalendar className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-blue-800/80 text-sm">Laporan yang sudah dibuat</div>
              </CardContent>
            </Card>

            <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardDescription className="text-blue-700/80">Disetujui</CardDescription>
                  <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{studentStats.approvedLogbook}</CardTitle>
                </div>
                <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
                  <IconCheck className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-blue-800/80 text-sm">Logbook yang sudah disetujui</div>
              </CardContent>
            </Card>

            <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardDescription className="text-blue-700/80">Menunggu</CardDescription>
                  <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{studentStats.pendingLogbook}</CardTitle>
                </div>
                <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
                  <IconClock className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-blue-800/80 text-sm">Menunggu review guru</div>
              </CardContent>
            </Card>

            <Card className="@container/card rounded-2xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardDescription className="text-blue-700/80">Perlu Perbaikan</CardDescription>
                  <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl text-blue-900">{studentStats.rejectedLogbook}</CardTitle>
                </div>
                <div className="bg-blue-500/15 text-blue-600 ring-1 ring-blue-200/60 mt-1 flex size-10 items-center justify-center rounded-xl">
                  <IconAlertCircle className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-blue-800/80 text-sm">Logbook yang perlu diperbaiki</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Magang Status */}
          <Card className="lg:col-span-2 rounded-xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle>Status Magang</CardTitle>
              <CardDescription>
                Progress dan informasi magang Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress Magang</span>
                  <span className="text-sm text-muted-foreground">{studentStats.magangProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${studentStats.magangProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deadline berikutnya:</span>
                  <span className="font-medium">{studentStats.nextDeadline}</span>
                </div>
                <div className="pt-2">
                  <Badge variant={studentStats.activeMagang ? "default" : "secondary"}>
                    {studentStats.activeMagang ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="rounded-xl border border-blue-100/70 bg-white/70 shadow-lg backdrop-blur hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>
                Update terbaru dari kegiatan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {activity.status === "approved" ? "Disetujui" : 
                       activity.status === "progress" ? "Progress" : 
                       activity.status === "rejected" ? "Ditolak" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
