"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)

  const loadNotifications = React.useCallback(async () => {
    if (!user?.id || !supabaseBrowser) {
      console.log("⚠️ Cannot load notifications - user or supabase not ready")
      return
    }

    try {
      console.log("🔔 Loading in-app notifications for user:", user.id)

      const { data, error } = await supabaseBrowser
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("❌ Error loading notifications:", error)
        return
      }

      console.log("✅ In-app notifications loaded:", data?.length || 0, data)
      setNotifications(data || [])

      const unread = data?.filter(n => !n.is_read).length || 0
      setUnreadCount(unread)
      console.log("📊 Unread count:", unread)
    } catch (err) {
      console.error("❌ Error loading notifications:", err)
    }
  }, [user])

  React.useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Realtime
  React.useEffect(() => {
    if (!user?.id || !supabaseBrowser) return

    const channel = supabaseBrowser
      .channel(`notif-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => loadNotifications())
      .subscribe()

    return () => { 
      if (supabaseBrowser) {
        supabaseBrowser.removeChannel(channel) 
      }
    }
  }, [user?.id, loadNotifications])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = async (notif: any) => {
    if (!supabaseBrowser) return
    
    // Mark as read
    await supabaseBrowser.from("notifications").update({ is_read: true }).eq("id", notif.id)
    
    // Navigate
    if (notif.action_url) router.push(notif.action_url)
    
    loadNotifications()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8 md:h-9 md:w-9 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => {
            console.log("🔔 Bell clicked - Force reload notifications");
            loadNotifications();
          }}
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 p-0 flex items-center justify-center text-[10px] md:text-xs font-semibold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-[calc(100vw-2rem)] sm:w-96 md:w-[420px] bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-gray-900">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{unreadCount} baru</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Tidak ada notifikasi</p>
              <p className="text-xs text-gray-500 mt-1">Notifikasi akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    !notif.is_read ? "bg-blue-50/50" : "bg-white"
                  }`}
                  onClick={() => handleClick(notif)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      !notif.is_read ? "bg-blue-600" : "bg-transparent"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 mb-1">{notif.title}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{notif.message}</p>
                      <p> clasname </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

