import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Create Supabase client with service role
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

    // Get user's push subscriptions
    const { data: tokens, error } = await supabase
      .from('notification_tokens')
      .select('device_token')
      .eq('user_id', userId)

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ 
        error: 'No subscriptions found for this user',
        userId 
      }, { status: 404 })
    }

    console.log(`Found ${tokens.length} subscription(s) for user ${userId}`)

    // Send push to all devices
    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          const subscription = JSON.parse(token.device_token)
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: title || 'Test Notification',
              body: body || 'This is a test push notification!',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-192x192.png',
              tag: 'test-notification',
              requireInteraction: false,
              silent: false,
              renotify: true,
              data: {
                url: '/',
                timestamp: Date.now()
              }
            })
          )
          return { success: true }
        } catch (error: unknown) {
          console.error('Error sending to device:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return { success: false, error: errorMessage }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      userId,
      sent: successful,
      failed: failed,
      total: tokens.length
    })
  } catch (error: unknown) {
    console.error('Test push error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to send push',
      details: errorMessage 
    }, { status: 500 })
  }
}