"use client"
//  ROLE GURU //
import { useRole } from "@/context/role-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, User } from "lucide-react"

export function RoleSelector() {
  const { setRole } = useRole()

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Sistem Manajemen Magang</h1>
          <p className="text-muted-foreground">Pilih peran Anda untuk melanjutkan</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setRole("guru")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Guru</CardTitle>
              <CardDescription>
                Akses untuk mengelola dan memantau kegiatan magang siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Melihat data siswa magang</li>
                <li>• Mengelola logbook siswa</li>
                <li>• Memberikan penilaian</li>
                <li>• Mengakses laporan</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setRole("siswa")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Siswa</CardTitle>
              <CardDescription>
                Akses untuk mengelola kegiatan magang dan logbook pribadi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Mengisi logbook harian</li>
                <li>• Melihat jadwal magang</li>
                <li>• Mengakses materi pembelajaran</li>
                <li>• Melihat progress magang</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


