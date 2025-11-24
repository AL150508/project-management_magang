"use client"

import * as React from "react"

// Type untuk user data
export interface User {
  id: string
  email: string
  fullName: string
  username: string
  avatar?: string
  provider?: "email" | "google" | "github"
}

// Interface untuk auth context value
interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, recaptchaToken?: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

// Interface untuk register data
export interface RegisterData {
  email: string
  fullName: string
  username: string
  password: string
  recaptchaToken?: string
}

// Buat context untuk auth management
const AuthContext = React.createContext<AuthContextValue | null>(null)

// Hook untuk menggunakan auth context
export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

// Provider component untuk auth management
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Initialize dari Supabase session
  React.useEffect(() => {
    let mounted = true
    
    async function initAuth() {
      try {
        // Import Supabase client
        const { supabaseBrowser } = await import("@/lib & database connection/supabase-browser")
        if (!supabaseBrowser) {
          setIsLoading(false)
          return
        }
        
        // Get current session
        const { data: { session } } = await supabaseBrowser.auth.getSession()
        
        if (session?.user && mounted) {
          // Load user data from database for consistency
          let avatarUrl = session.user.user_metadata?.avatar_url
          let fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User"
          let username = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "user"
          
          try {
            const { data: dbUser } = await supabaseBrowser
              .from('users')
              .select('avatar, full_name, username')
              .eq('id', session.user.id)
              .maybeSingle()
            
            if (dbUser) {
              // Prefer database values over metadata for consistency
              if (dbUser.avatar) avatarUrl = dbUser.avatar
              if (dbUser.full_name) fullName = dbUser.full_name
              if (dbUser.username) username = dbUser.username
            }
          } catch (error) {
            console.log('Could not load user data from database, using metadata:', error)
          }
          
          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            fullName,
            username,
            avatar: avatarUrl,
            provider: (session.user.app_metadata?.provider as "email" | "google" | "github") || "email"
          }
          setUser(userData)
        }
        
        // Listen for auth changes
        const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state change:", event)
          
          if (session?.user && mounted) {
            // Load user data from database for consistency
            let avatarUrl = session.user.user_metadata?.avatar_url
            let fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User"
            let username = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "user"
            
            try {
              const { data: dbUser } = await supabaseBrowser
                .from('users')
                .select('avatar, full_name, username')
                .eq('id', session.user.id)
                .maybeSingle()
              
              if (dbUser) {
                // Prefer database values over metadata for consistency
                if (dbUser.avatar) avatarUrl = dbUser.avatar
                if (dbUser.full_name) fullName = dbUser.full_name
                if (dbUser.username) username = dbUser.username
              }
            } catch (error) {
              console.log('Could not load user data from database, using metadata:', error)
            }
            
            const userData: User = {
              id: session.user.id,
              email: session.user.email || "",
              fullName,
              username,
              avatar: avatarUrl,
              provider: (session.user.app_metadata?.provider as "email" | "google" | "github") || "email"
            }
            setUser(userData)
          } else if (event === "SIGNED_OUT" && mounted) {
            setUser(null)
          }
        })
        
        if (mounted) setIsLoading(false)
        
        // Cleanup
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth init error:", error)
        if (mounted) setIsLoading(false)
      }
    }
    
    initAuth()
    
    return () => {
      mounted = false
    }
  }, [])

  // No need for localStorage - Supabase handles session automatically

  const login = async (email: string, password: string, recaptchaToken?: string) => {
    setIsLoading(true)
    try {
      // Validasi reCAPTCHA jika token disediakan
      if (recaptchaToken) {
        console.log("reCAPTCHA token received:", recaptchaToken)
        // TODO: Verifikasi reCAPTCHA token dengan backend
      }
      
      // Import Supabase client
      const { supabaseBrowser } = await import("@/lib & database connection/supabase-browser")
      if (!supabaseBrowser) throw new Error("Supabase client not available")
      
      // Real Supabase login
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      if (!data.user) throw new Error("No user data returned")
      
      // Set user dari Supabase
      const userData: User = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split("@")[0],
        username: data.user.user_metadata?.username || email.split("@")[0],
        avatar: data.user.user_metadata?.avatar_url,
        provider: "email"
      }
      
      setUser(userData)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      // Validasi reCAPTCHA jika token disediakan
      if (userData.recaptchaToken) {
        console.log("reCAPTCHA token received:", userData.recaptchaToken)
        // TODO: Verifikasi reCAPTCHA token dengan backend
      }
      
      // Import Supabase client
      const { supabaseBrowser } = await import("@/lib & database connection/supabase-browser")
      if (!supabaseBrowser) throw new Error("Supabase client not available")
      
      // Real Supabase register
      const { data, error } = await supabaseBrowser.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            username: userData.username,
          }
        }
      })
      
      if (error) throw error
      if (!data.user) throw new Error("No user data returned")
      
      // Set user dari Supabase
      const newUser: User = {
        id: data.user.id,
        email: data.user.email || userData.email,
        fullName: userData.fullName,
        username: userData.username,
        provider: "email"
      }
      
      setUser(newUser)
    } catch (error) {
      console.error("Register error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      // Import Supabase client
      const { createClient } = await import('@supabase/supabase-js')
       
      // Buat Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn("Supabase credentials tidak ditemukan, menggunakan mock login")
        
        // Fallback ke mock Google login
        const mockUser: User = {
          id: "google_" + Date.now(),
          email: "user@gmail.com",
          fullName: "Google User",
          username: "google_user",
          provider: "google"
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        setUser(mockUser)
        return
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Redirect ke Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account"
          }
        }
      })
      
      if (error) {
        throw error
      }
      
      console.log("Redirecting to Google OAuth...")
      
    } catch (error) {
      console.error("Google login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGithub = async () => {
    setIsLoading(true)
    try {
      // TODO: Implementasi GitHub OAuth dengan Supabase
      console.log("GitHub OAuth login")
      
      // Simulasi GitHub login
      const mockUser: User = {
        id: "github_" + Date.now(),
        email: "user@github.com",
        fullName: "GitHub User",
        username: "github_user",
        provider: "github"
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser(mockUser)
    } catch (error) {
      console.error("GitHub login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('[Auth] Logging out...')
      const { supabaseBrowser } = await import("@/lib & database connection/supabase-browser")
      if (supabaseBrowser) {
        await supabaseBrowser.auth.signOut()
        console.log('[Auth] Supabase signOut completed')
      }
      setUser(null)
      console.log('[Auth] User state cleared')
      
      // Redirect to home/login page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null) // Force logout anyway
      // Still redirect even if error
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    logout,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
