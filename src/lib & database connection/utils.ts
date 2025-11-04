import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function untuk menggabungkan CSS classes dengan aman
// Menggunakan clsx untuk conditional classes dan twMerge untuk menghindari konflik Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)) // Gabungkan dan merge classes dengan benar
}
