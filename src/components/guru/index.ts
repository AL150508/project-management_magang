// Entry point komponen untuk area Guru (re-export)
// Tujuan: memudahkan import dari satu tempat tanpa mengubah implementasi aslinya.
export { TeacherHeader } from "@/components/teacher-header"
export { TeacherSidebar } from "@/components/teacher-sidebar"

export { MagangTable } from "@/components/guru/magang/table" // Tabel data siswa magang untuk guru
export type { MagangItem } from "@/components/guru/magang/table" // Tipe baris data
export { MagangModal } from "@/components/guru/magang/modal" // Modal input/edit data magang

// Aliases (nama ramah Indonesia)
export { TeacherHeader as HeaderGuru } from "@/components/teacher-header"
export { TeacherSidebar as SidebarGuru } from "@/components/teacher-sidebar"
export { MagangTable as TabelSiswa } from "@/components/guru/magang/table"
export type { MagangItem as ItemMagangSiswa } from "@/components/guru/magang/table"
export { MagangModal as ModalMagangSiswa } from "@/components/guru/magang/modal"
