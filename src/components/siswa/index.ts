// Entry point komponen untuk area Siswa (re-export)
// Memusatkan ekspor agar import di halaman lain lebih rapi.
export { StudentHeader } from "@/components/student-header"
export { StudentSidebar } from "@/components/student-sidebar"
export { StatusMagangSiswa } from "@/components/siswa/status-magang/card"

// Aliases (nama ramah Indonesia)
export { StudentHeader as HeaderSiswa } from "@/components/student-header"
export { StudentSidebar as SidebarSiswa } from "@/components/student-sidebar"
export { StatusMagangSiswa as KartuStatusMagangSiswa } from "@/components/siswa/status-magang/card"
