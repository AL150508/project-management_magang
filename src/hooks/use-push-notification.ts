"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { supabaseBrowser } from "@/lib & database connection/supabase-browser"

export function usePushNotification() {
  const { user } = useAuth()
  const [isSupported, setIsSupported] = React.useState(false)
  const [subscription, setSubscription] = React.useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = React.useState(false)
  const [permission, setPermission] = React.useState<NotificationPermission>("default")
  const [loading, setLoading] = React.useState(false)

  // Check if browser supports notifications and service workers
  React.useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      
      // Check existing subscription
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub)
          setIsSubscribed(!!sub)
        })
      })
    }
  }, [])

  // Request notification permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported')
    }

    try {
      // Check current permission first
      const currentPermission = Notification.permission
      console.log('[Push] Current permission:', currentPermission)
      
      if (currentPermission === 'granted') {
        setPermission('granted')
        return 'granted'
      }
      
      if (currentPermission === 'denied') {
        setPermission('denied')
        throw new Error('Notification permission denied. Please enable notifications in browser settings.')
      }

      // Request permission
      console.log('[Push] Requesting permission...')
      const result = await Notification.requestPermission()
      setPermission(result)
      console.log('[Push] Permission result:', result)
      
      // Wait a bit for permission to propagate
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return result
    } catch (error) {
      console.error('[Push] Permission error:', error)
      throw error
    }
  }

  // Subscribe to push notifications
  const subscribe = async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported')
    }

    if (!user) {
      throw new Error("User not authenticated")
    }

    setLoading(true)
    try {
      // Ensure service worker is registered and ready first
      console.log('[Push] Waiting for service worker...')
      const registration = await navigator.serviceWorker.ready
      console.log('[Push] Service Worker ready:', registration)
      
      // Small delay to ensure SW is fully initialized
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Request permission
      const perm = await requestPermission()
      
      if (perm !== 'granted') {
        throw new Error(`Permission ${perm}. Please allow notifications in your browser settings.`)
      }
      
      // Re-verify permission after waiting
      const finalPermission = Notification.permission
      console.log('[Push] Final permission check:', finalPermission)
      
      if (finalPermission !== 'granted') {
        throw new Error('Permission not properly granted. Please try again.')
      }

      // Check if already subscribed
      let sub = await registration.pushManager.getSubscription()
      
      if (sub) {
        console.log('[Push] Already subscribed, using existing subscription:', sub)
      } else {
        // Get VAPID public key
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicKey) {
          throw new Error('VAPID public key not configured')
        }

        console.log('[Push] VAPID key length:', publicKey.length)

        // Subscribe to push notifications
        try {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
          })
          console.log('[Push] New subscription created:', sub)
        } catch (subError) {
          console.error('[Push] Subscribe error details:', subError)
          throw new Error(`Failed to subscribe: ${subError instanceof Error ? subError.message : 'Unknown error'}`)
        }
      }

      setSubscription(sub)
      setIsSubscribed(true)

      // Save subscription to database
      console.log('[Push] Saving subscription to database...')
      if (!supabaseBrowser) {
        console.warn('[Push] Supabase not available, skipping database save')
        // Don't throw - subscription still works without DB save
        return sub
      }
      
      try {
        const subscriptionJson = JSON.stringify(sub.toJSON())
        console.log('[Push] Subscription data prepared, upserting...')
        
        const { error: upsertError } = await supabaseBrowser
          .from("notification_tokens")
          .upsert({
            user_id: user.id,
            device_token: subscriptionJson,
            platform: "web",
            updated_at: new Date().toISOString(),
          })

        if (upsertError) {
          console.error('[Push] Database save failed:', upsertError)
          // Don't throw - subscription still works
          console.log('[Push] Subscription active but not saved to DB')
        } else {
          console.log('[Push] ✅ Subscription saved to database successfully')
        }
      } catch (dbError) {
        console.error('[Push] Database error:', dbError)
        // Continue anyway - subscription is still active
      }

      console.log('[Push] ✅ Subscribe process completed')
      return sub
    } catch (error) {
      console.error('[Push] Subscribe error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    if (!subscription) {
      return
    }

    setLoading(true)
    try {
      await subscription.unsubscribe()
      setSubscription(null)
      setIsSubscribed(false)

      // Remove from database
      if (user && supabaseBrowser) {
        await supabaseBrowser
          .from("notification_tokens")
          .delete()
          .eq("user_id", user.id)
          .eq("device_token", JSON.stringify(subscription.toJSON()))
      }

      console.log('[Push] Unsubscribed successfully')
    } catch (error) {
      console.error('[Push] Unsubscribe error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    permission,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}