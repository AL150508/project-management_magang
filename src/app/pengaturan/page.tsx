import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Pengaturan & Panduan",
  description: "Panduan singkat penggunaan fitur aplikasi",
}

export default function PengaturanPage() {
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Pengaturan & Panduan</h1>
          <p className="text-sm text-gray-600">Ringkasan fitur utama dan cara pakainya.</p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profil Akun */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Profil Akun</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-3">
            <div>
              <p className="font-medium">Foto Profil</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Buka <Link href="/profile" className="text-blue-600 underline">Profil</Link>.</li>
                <li>Klik ikon kamera di avatar, pilih gambar (maks 5MB).</li>
                <li>Crop lalu simpan. Foto akan otomatis ter-update.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Nama & Email</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Edit nama, kemudian klik “Simpan Perubahan”.</li>
                <li>Email bersifat read-only.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Ubah Password</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Isi password baru dan konfirmasi.</li>
                <li>Tekan “Ubah Password”. Akan muncul toast sukses bila berhasil.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Magang & QR Link */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Data Magang & QR/Link</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-3">
            <div>
              <p className="font-medium">Data Magang</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Guru: buka <Link href="/magang" className="text-blue-600 underline">Magang</Link> untuk kelola data.</li>
                <li>Klik ikon QR untuk membuka modal QR & salin link detail.</li>
                <li>Detail dapat dibuka via <code className="bg-gray-100 px-1 rounded">/magang/detail/[id]</code>.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">QR / Link</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gunakan tombol “Copy” untuk menyalin link.</li>
                <li>Gunakan “Download” untuk simpan QR.</li>
                <li>Di production (npm run start), PWA aktif dan bisa diakses offline terbatas.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Logbook */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Logbook</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-3">
            <ul className="list-disc pl-5 space-y-1">
              <li>Siswa: buka <Link href="/logbook" className="text-blue-600 underline">Logbook</Link> untuk catatan harian.</li>
              <li>Pastikan isi tanggal, kegiatan, dan simpan.</li>
              <li>Guru dapat meninjau dan memverifikasi catatan.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Notifikasi Push */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Notifikasi Push</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-3">
            <ul className="list-disc pl-5 space-y-1">
              <li>Aktifkan dari menu profil melalui “Notifikasi Aktif/Nonaktif”.</li>
              <li>Push berjalan saat mode production: <code className="bg-gray-100 px-1 rounded">npm run build && npm run start</code>.</li>
              <li>Pastikan izin notifikasi di browser diizinkan.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tips & Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Tips & Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li>Gunakan menu navigasi untuk perpindahan halaman tanpa reload (SPA).</li>
            <li>Jika halaman tidak terbuka saat production, pastikan build sukses.</li>
            <li>Bersihkan cache browser bila tampilan tidak ter-update.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}