import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

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

    let query = supabase
      .from('notification_tokens')
      .select('device_token, user_id')

    // Filter by userId or role
    if (userId) {
      query = query.eq('user_id', userId)
    } else if (targetRole) {
      // Get users by role
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('role', targetRole)
      
      if (users && users.length > 0) {
        const userIds = users.map(u => u.id)
        query = query.in('user_id', userIds)
      } else {
        return NextResponse.json({ 
          success: true, 
          sent: 0, 
          message: 'No users found with this role' 
        })
      }
    }

    const { data: tokens, error } = await query

    if (error) throw error
    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sent: 0,
        message: 'No subscriptions found' 
      })
    }

    // Send push to all devices
    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          const subscription = JSON.parse(token.device_token)
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
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

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: results.length - successful,
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