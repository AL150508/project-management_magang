import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Ensure Node.js runtime and no caching
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { userId, targetRole, title, body, icon, url } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('[SendPush] ===== NEW PUSH REQUEST =====')
    console.log('[SendPush] Incoming payload:', { userId, targetRole, title, body })
    console.log('[SendPush] Timestamp:', new Date().toISOString())

    let query = supabase
      .from('notification_tokens')
      .select('device_token, user_id, platform, created_at')

    // Filter by userId or role
    if (userId) {
      console.log('[SendPush] 🎯 Filtering by userId:', userId)
      query = query.eq('user_id', userId)
    } else if (targetRole) {
      console.log('[SendPush] 🎯 Filtering by role:', targetRole)
      // Get users by role
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', targetRole)

      if (usersError) {
        console.error('[SendPush] ❌ Error fetching users by role:', usersError)
      }
      
      if (users && users.length > 0) {
        const userIds = users.map(u => u.id)
        console.log('[SendPush] ✅ Found users for role:', targetRole, 'count:', users.length)
        console.log('[SendPush] User IDs:', userIds.map(id => id.substring(0, 8) + '...').join(', '))
        query = query.in('user_id', userIds)
      } else {
        console.warn('[SendPush] ⚠️ No users found with role', targetRole)
        return NextResponse.json({ 
          success: true, 
          sent: 0,
          message: `No users found with role: ${targetRole}` 
        })
      }
    }

    const { data: tokensData, error: tokensError } = await query

    if (tokensError) {
      console.error('[SendPush] ❌ Error fetching tokens:', tokensError)
      throw tokensError
    }
    
    const tokens = tokensData

    if (!tokens || tokens.length === 0) {
      console.warn('[SendPush] ⚠️ No tokens found for filter')
      return NextResponse.json({ 
        success: true, 
        sent: 0,
        message: 'No subscriptions found' 
      })
    }

    console.log('[SendPush] ✅ Tokens found:', tokens.length)
    console.log('[SendPush] Token details:')
    tokens.forEach((t, i) => {
      console.log(`  [${i + 1}] User: ${t.user_id.substring(0, 8)}... | Platform: ${t.platform} | Created: ${t.created_at}`)
    })

    // Send push to all devices
    console.log('[SendPush] 📤 Starting to send push notifications...')
    const expiredTokens: string[] = []
    const results = await Promise.allSettled(
      tokens.map(async (token, index) => {
        try {
          const subscription = JSON.parse(token.device_token)
          const payload = {
            title: title || 'Notifikasi Baru',
            body: body || '',
            icon: icon || '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: 'magang-notification',
            requireInteraction: false,
            silent: false,
            renotify: true,
            data: {
              url: url || '/',
              timestamp: Date.now()
            }
          }
          
          console.log(`[SendPush] 📨 Sending to device [${index + 1}/${tokens.length}]`)
          console.log(`[SendPush]   User: ${token.user_id.substring(0, 8)}...`)
          console.log(`[SendPush]   Payload:`, { title: payload.title, body: payload.body.substring(0, 50) })
          
          await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
          )
          
          console.log(`[SendPush] ✅ Successfully sent to device [${index + 1}]`)
          return { success: true }
        } catch (error: unknown) {
          console.error(`[SendPush] ❌ Error sending to device [${index + 1}]:`, error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          // Check if token is expired (status code 401, 404, 410)
          if (errorMessage.includes('401') || errorMessage.includes('404') || errorMessage.includes('410')) {
            console.warn('[SendPush] 🗑️ Token expired or invalid, marking for removal:', token.user_id.substring(0, 8) + '...')
            expiredTokens.push(token.device_token)
          }
          
          return { success: false, error: errorMessage }
        }
      })
    )

    // Remove expired tokens from database
    if (expiredTokens.length > 0) {
      console.log('[SendPush] 🗑️ Removing', expiredTokens.length, 'expired tokens from database')
      const { error: deleteError } = await supabase
        .from('notification_tokens')
        .delete()
        .in('device_token', expiredTokens)
      
      if (deleteError) {
        console.error('[SendPush] ❌ Error removing expired tokens:', deleteError)
      } else {
        console.log('[SendPush] ✅ Successfully removed expired tokens')
      }
    }

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log('[SendPush] ===== PUSH RESULT =====')
    console.log(`[SendPush] ✅ Successful: ${successful}`)
    console.log(`[SendPush] ❌ Failed: ${failed}`)
    console.log(`[SendPush] 🗑️ Expired: ${expiredTokens.length}`)
    console.log(`[SendPush] 📊 Total: ${tokens.length}`)

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      expired: expiredTokens.length,
      total: tokens.length
    })
  } catch (error: unknown) {
    console.error('Send push error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to send push',
      details: errorMessage 
    }, { status: 500 })
  }
}