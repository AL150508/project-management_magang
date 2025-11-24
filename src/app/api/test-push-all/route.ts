import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Ensure this route runs on Node.js runtime and is always dynamic (no caching)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Test endpoint: Send push to ALL devices in database
 * No role filtering, no user filtering
 * Just send to everyone!
 */
export async function POST(request: NextRequest) {
  try {
    const { title, body, icon, url } = await request.json()

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

    console.log('[TestPushAll] ===== SENDING TO ALL DEVICES =====')
    console.log('[TestPushAll] Title:', title)
    console.log('[TestPushAll] Body:', body)
    console.log('[TestPushAll] Timestamp:', new Date().toISOString())

    // Get ALL tokens from database (no filter)
    const { data: tokens, error: tokensError } = await supabase
      .from('notification_tokens')
      .select('device_token, user_id, platform, created_at')

    if (tokensError) {
      console.error('[TestPushAll] ❌ Error fetching tokens:', tokensError)
      throw tokensError
    }

    if (!tokens || tokens.length === 0) {
      console.warn('[TestPushAll] ⚠️ No tokens found in database')
      return NextResponse.json({
        success: false,
        message: 'No devices found. Please subscribe first.',
        sent: 0
      })
    }

    console.log('[TestPushAll] ✅ Found tokens:', tokens.length)
    console.log('[TestPushAll] Token details:')
    tokens.forEach((t, i) => {
      console.log(`  [${i + 1}] User: ${t.user_id.substring(0, 8)}... | Platform: ${t.platform} | Created: ${t.created_at}`)
    })

    // Send push to ALL devices
    console.log('[TestPushAll] 📤 Starting to send push notifications to ALL devices...')
    const expiredTokens: string[] = []
    const results = await Promise.allSettled(
      tokens.map(async (token, index) => {
        try {
          const subscription = JSON.parse(token.device_token)
          const payload = {
            title: title || '🧪 Test Push to All',
            body: body || 'This notification was sent to ALL devices!',
            icon: icon || '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: 'test-all-notification',
            requireInteraction: true,
            silent: false,
            renotify: true,
            data: {
              url: url || '/',
              timestamp: Date.now()
            }
          }

          console.log(`[TestPushAll] 📨 Sending to device [${index + 1}/${tokens.length}]`)
          console.log(`[TestPushAll]   User: ${token.user_id.substring(0, 8)}...`)
          console.log(`[TestPushAll]   Endpoint: ${subscription.endpoint.substring(0, 50)}...`)

          await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
          )

          console.log(`[TestPushAll] ✅ Successfully sent to device [${index + 1}]`)
          return { success: true }
        } catch (error: unknown) {
          console.error(`[TestPushAll] ❌ Error sending to device [${index + 1}]:`, error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'

          // Check if token is expired
          if (errorMessage.includes('401') || errorMessage.includes('404') || errorMessage.includes('410')) {
            console.warn('[TestPushAll] 🗑️ Token expired, marking for removal:', token.user_id.substring(0, 8) + '...')
            expiredTokens.push(token.device_token)
          }

          return { success: false, error: errorMessage }
        }
      })
    )

    // Remove expired tokens
    if (expiredTokens.length > 0) {
      console.log('[TestPushAll] 🗑️ Removing', expiredTokens.length, 'expired tokens')
      await supabase
        .from('notification_tokens')
        .delete()
        .in('device_token', expiredTokens)
    }

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log('[TestPushAll] ===== RESULT =====')
    console.log(`[TestPushAll] ✅ Successful: ${successful}`)
    console.log(`[TestPushAll] ❌ Failed: ${failed}`)
    console.log(`[TestPushAll] 🗑️ Expired: ${expiredTokens.length}`)
    console.log(`[TestPushAll] 📊 Total: ${tokens.length}`)

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      expired: expiredTokens.length,
      total: tokens.length,
      message: `Push sent to ${successful} device(s)`
    })
  } catch (error: unknown) {
    console.error('[TestPushAll] ❌ Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'Failed to send push',
      details: errorMessage
    }, { status: 500 })
  }
}
