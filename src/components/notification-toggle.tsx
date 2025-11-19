"use client"

import * as React from "react"
import { usePushNotification } from "@/hooks/use-push-notification"
import { Bell, BellOff, BellRing } from "lucide-react"
import { toast } from "sonner"

export function NotificationToggle() {
  const { isSubscribed, loading, subscribe, unsubscribe, permission } = usePushNotification()

  const handleToggle = async () => {
    console.log('[NotificationToggle] Button clicked, isSubscribed:', isSubscribed)
    
    try {
      if (isSubscribed) {
        console.log('[NotificationToggle] Unsubscribing...')
        await unsubscribe()
        console.log('[NotificationToggle] ✅ Unsubscribe success')
        toast.success("Notifikasi dinonaktifkan")
      } else {
        console.log('[NotificationToggle] Subscribing...')
        const result = await subscribe()
        console.log('[NotificationToggle] ✅ Subscribe success:', result)
        toast.success("Notifikasi aktif!", {
          icon: <BellRing className="h-4 w-4" />,
          description: "Push notifications berhasil diaktifkan"
        })
      }
    } catch (error) {
      console.error('[NotificationToggle] ❌ Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
      
      if (permission === "denied" || errorMessage.includes('denied') || errorMessage.includes('Permission')) {
        toast.error("Notifikasi diblokir!", {
          description: "Silakan aktifkan di pengaturan browser."
        })
      } else {
        toast.error("Gagal mengaktifkan notifikasi", {
          description: errorMessage
        })
      }
    }
  }

  // Handle permission denied state
  if (permission === "denied") {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed opacity-60"
      >
        <BellOff className="h-4 w-4" />
        Diblokir
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
        transition-all duration-200 shadow-sm
        ${loading
          ? "bg-blue-500 text-white cursor-wait"
          : isSubscribed 
          ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800" 
          : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600"
        }
        disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
    >
      {loading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          <span className="font-medium">Loading...</span>
        </>
      ) : isSubscribed ? (
        <>
          <Bell className="h-4 w-4" />
          <span className="font-medium">Notifikasi Aktif</span>
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          <span className="font-medium">Aktifkan Notifikasi</span>
        </>
      )}
    </button>
  )
}