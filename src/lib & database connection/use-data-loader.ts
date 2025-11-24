/**
 * Custom hook untuk handle data loading dengan timeout dan error handling
 * Mencegah loading stuck dan memberikan feedback yang jelas ke user
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseDataLoaderOptions<T> {
  /**
   * Function untuk fetch data dari database
   */
  fetchFn: () => Promise<T>
  
  /**
   * Timeout dalam milidetik (default: 15000 / 15 detik)
   */
  timeout?: number
  
  /**
   * Auto reload ketika ada dependency change
   */
  dependencies?: unknown[]
  
  /**
   * Callback saat data berhasil di-load
   */
  onSuccess?: (data: T) => void
  
  /**
   * Callback saat error
   */
  onError?: (error: Error) => void
}

export interface UseDataLoaderResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/**
 * Hook untuk handle data loading dengan timeout protection
 */
export function useDataLoader<T>(
  options: UseDataLoaderOptions<T>
): UseDataLoaderResult<T> {
  const {
    fetchFn,
    timeout = 15000, // 15 detik default timeout
    dependencies = [],
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadData = useCallback(async () => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    // Set timeout untuk prevent stuck loading
    const timeoutId = setTimeout(() => {
      console.error('⏱️ Data loading timeout after', timeout, 'ms')
      setLoading(false)
      setError('Waktu tunggu habis. Koneksi terlalu lambat atau server tidak merespon.')
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }, timeout)

    timeoutRef.current = timeoutId

    try {
      console.log('🔄 Loading data...')
      const result = await fetchFn()
      
      // Clear timeout karena berhasil
      clearTimeout(timeoutId)
      
      console.log('✅ Data loaded successfully')
      setData(result)
      setError(null)
      
      onSuccess?.(result)
    } catch (err) {
      // Clear timeout
      clearTimeout(timeoutId)
      
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('⚠️ Request aborted')
        return
      }

      console.error('❌ Error loading data:', err)
      
      let errorMessage = 'Gagal memuat data'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      onError?.(err as Error)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeout, ...dependencies])

  // Initial load
  useEffect(() => {
    loadData()

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadData])

  return {
    data,
    loading,
    error,
    reload: loadData
  }
}

/**
 * Hook untuk realtime subscription dengan proper cleanup
 */
export function useRealtimeSubscription(
  tableName: string,
  onDataChange: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return

    console.log(`🔴 Setting up realtime subscription for table: ${tableName}`)

    // Dynamic import to avoid server-side rendering issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null

    const setupSubscription = async () => {
      try {
        const { supabaseBrowser } = await import('@/lib & database connection/supabase-browser')
        
        if (!supabaseBrowser) {
          console.warn('⚠️ Supabase client not available for realtime subscription')
          return
        }

        channel = supabaseBrowser
          .channel(`realtime-${tableName}-${Date.now()}`) // Unique channel name
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: tableName },
            (payload) => {
              console.log(`🔔 Realtime update for ${tableName}:`, payload.eventType)
              onDataChange()
            }
          )
          .subscribe((status) => {
            console.log(`📡 Realtime subscription status for ${tableName}:`, status)
          })
      } catch (err) {
        console.error('❌ Error setting up realtime subscription:', err)
      }
    }

    setupSubscription()

    // Cleanup
    return () => {
      console.log(`🔴 Cleaning up realtime subscription for table: ${tableName}`)
      if (channel) {
        import('@/lib & database connection/supabase-browser').then(({ supabaseBrowser }) => {
          if (supabaseBrowser) {
            supabaseBrowser.removeChannel(channel)
          }
        })
      }
    }
  }, [tableName, onDataChange, enabled])
}
