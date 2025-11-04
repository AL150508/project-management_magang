"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconCalendar, IconClock, IconCheck, IconAlertCircle, IconTrendingUp } from "@tabler/icons-react"

interface StudentDashboardProps {
  userName: string
}

export function StudentDashboard({ userName }: StudentDashboardProps) {
  // Data dummy untuk dashboard siswa
  const studentStats = {
    totalLogbook: 12,
    approvedLogbook: 8,
    pendingLogbook: 3,
    rejectedLogbook: 1,
    activeMagang: true,
    magangProgress: 75,
    nextDeadline: "2024-03-15"
  }

  const recentActivities = [
    {
      id: 1,
      type: "logbook",
      title: "Logbook hari ini disetujui",
      time: "2 jam yang lalu",
      status: "approved"
    },
    {
      id: 2,
      type: "magang",
      title: "Progress magang 75%",
      time: "1 hari yang lalu",
      status: "progress"
    },
    {
      id: 3,
      type: "logbook",
      title: "Logbook perlu perbaikan",
      time: "2 hari yang lalu",
      status: "rejected"
    }
  ]

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
    <div className="flex-1 bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat datang, {userName}!
          </h1>
          <p className="text-gray-600">
            Kelola kegiatan magang dan logbook harian Anda
          </p>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logbook</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentStats.totalLogbook}</div>
              <p className="text-xs text-muted-foreground">
                Laporan yang sudah dibuat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
              <IconCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{studentStats.approvedLogbook}</div>
              <p className="text-xs text-muted-foreground">
                Logbook yang sudah disetujui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
              <IconClock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{studentStats.pendingLogbook}</div>
              <p className="text-xs text-muted-foreground">
                Menunggu review guru
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perlu Perbaikan</CardTitle>
              <IconAlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{studentStats.rejectedLogbook}</div>
              <p className="text-xs text-muted-foreground">
                Logbook yang perlu diperbaiki
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Magang Status */}
          <Card className="lg:col-span-2">
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
          <Card>
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
