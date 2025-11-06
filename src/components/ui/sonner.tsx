"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

// Toaster (Sonner): komponen notifikasi toast yang mengikuti tema aplikasi dengan warna biru selaras project.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-slate-500",
          actionButton: "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
          success: "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200",
          warning: "group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
