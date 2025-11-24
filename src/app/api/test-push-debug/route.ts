import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Test endpoint to debug push notifications
export async function GET(request: NextRequest) {
  const diagnostics: Record<string, unknown> = {}

  try {
    // 1. Check VAPID configuration
    diagnostics.vapid = {
      email: process.env.VAPID_EMAIL ? '✅ Set' : '❌ Missing',
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? '✅ Set' : '❌ Missing',
      privateKey: process.env.VAPID_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
      publicKeyLength: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.length || 0,
      privateKeyLength: process.env.VAPID_PRIVATE_KEY?.length || 0,
    }

    // 2. Check Supabase configuration
    diagnostics.supabase = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    }

    // 3. Check database connection and tokens
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // Check notification_tokens table
      const { data: tokens, error: tokensError } = await supabase
        .from('notification_tokens')
        .select('user_id, platform, created_at')
        .limit(10)

      diagnostics.database = {
        tokensTable: tokensError ? `❌ Error: ${tokensError.message}` : '✅ Accessible',
        tokenCount: tokens?.length || 0,
        tokens: tokens?.map(t => ({
          user_id: t.user_id.substring(0, 8) + '...',
          platform: t.platform,
          created_at: t.created_at
        })) || []
      }

      // Check users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, role')
        .limit(5)

      diagnostics.users = {
        usersTable: usersError ? `❌ Error: ${usersError.message}` : '✅ Accessible',
        userCount: users?.length || 0,
        roles: users?.reduce((acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}
      }
    }

    // 4. Test VAPID configuration
    try {
      webpush.setVapidDetails(
        process.env.VAPID_EMAIL!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      )
      diagnostics.vapidConfig = '✅ Valid'
    } catch (vapidError) {
      diagnostics.vapidConfig = `❌ Invalid: ${vapidError instanceof Error ? vapidError.message : 'Unknown error'}`
    }

    return NextResponse.json({
      status: 'Push Notification Diagnostics',
      timestamp: new Date().toISOString(),
      diagnostics
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      diagnostics
    }, { status: 500 })
  }
}

// POST endpoint to send test push
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({
        error: 'userId required'
      }, { status: 400 })
    }

    // Configure VAPID
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    // Get user's subscription
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

    const { data: tokens, error } = await supabase
      .from('notification_tokens')
      .select('device_token')
      .eq('user_id', userId)

    if (error) throw error

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No subscription found for this user',
        hint: 'User needs to click "Aktifkan Notifikasi" button first'
      })
    }

    // Send test notification
    const results: Array<{ success: boolean; error?: string }> = []
    for (const token of tokens) {
      try {
        const subscription = JSON.parse(token.device_token)
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: '🧪 Test Push Notification',
            body: 'Jika Anda melihat notifikasi ini, push notification bekerja dengan baik! ✅',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: 'test-notification',
            requireInteraction: true,
            data: {
              url: '/dashboard',
              timestamp: Date.now()
            }
          })
        )
        results.push({ success: true })
      } catch (sendError) {
        results.push({
          success: false,
          error: sendError instanceof Error ? sendError.message : 'Unknown error'
        })
      }
    }

    const successful = results.filter(r => r.success).length

    return NextResponse.json({
      success: successful > 0,
      sent: successful,
      total: tokens.length,
      results
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to send test push',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
