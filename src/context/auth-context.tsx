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

  // Initialize dari localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("auth_user")
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error("Error parsing saved user:", error)
          localStorage.removeItem("auth_user")
        }
      }
      setIsLoading(false)
    }
  }, [])

  // Simpan user ke localStorage setiap kali berubah
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user))
      } else {
        localStorage.removeItem("auth_user")
      }
    }
  }, [user])

  const login = async (email: string, _password: string, recaptchaToken?: string) => {
    setIsLoading(true)
    try {
      // Validasi reCAPTCHA jika token disediakan
      if (recaptchaToken) {
        console.log("reCAPTCHA token received:", recaptchaToken)
        // TODO: Verifikasi reCAPTCHA token dengan backend
      }
      
      // TODO: Implementasi actual login dengan Supabase
      // Untuk sekarang, simulasi login
      const mockUser: User = {
        id: "1",
        email,
        fullName: "Test User",
        username: email.split("@")[0],
        provider: "email"
      }
      
      // Simulasi delay API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUser(mockUser)
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
      // TODO: Implementasi actual register dengan Supabase
      // Untuk sekarang, simulasi register
      const mockUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        fullName: userData.fullName,
        username: userData.username,
        provider: "email"
      }
      
      // Simulasi delay API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUser(mockUser)
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

  const logout = () => {
    setUser(null)
    // Clear localStorage akan dilakukan otomatis oleh useEffect
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
