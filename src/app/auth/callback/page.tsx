"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function AuthCallback() {
  const router = useRouter()
  const { setUser } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Import Supabase client
        const { createClient } = await import('@supabase/supabase-js')
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          console.error("Supabase credentials tidak ditemukan")
          router.push("/?error=missing_credentials")
          return
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Get session dari URL hash
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Auth callback error:", error)
          router.push("/?error=auth_failed")
          return
        }
        
        if (data.session && data.session.user) {
          const user = data.session.user
          
          // Convert Supabase user ke format aplikasi
          const appUser = {
            id: user.id,
            email: user.email || "",
            fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            username: user.user_metadata?.preferred_username || user.email?.split("@")[0] || "user",
            provider: "google" as const,
            avatar: user.user_metadata?.avatar_url
          }
          
          // Set user di context
          setUser(appUser)
          
          // Redirect ke halaman utama
          router.push("/?auth=success")
        } else {
          console.error("No session found")
          router.push("/?error=no_session")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        router.push("/?error=callback_failed")
      }
    }

    handleAuthCallback()
  }, [router, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Memproses Login...
        </h2>
        <p className="text-gray-600">
          Mohon tunggu, kami sedang memverifikasi akun Anda.
        </p>
      </div>
    </div>
  )
}
