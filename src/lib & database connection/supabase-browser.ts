"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Konfigurasi Supabase untuk browser/client-side
// Ambil URL dan API key dari environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL // URL database Supabase
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // API key untuk akses database

// Validasi konfigurasi Supabase
// Cek apakah environment variables sudah diset dengan benar
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    )
  }
}

// Export client Supabase untuk digunakan di seluruh aplikasi
// Jika konfigurasi lengkap, buat client. Jika tidak, return null
export const supabaseBrowser: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey) // Buat client dengan konfigurasi yang ada
    : null // Return null jika konfigurasi tidak lengkap


