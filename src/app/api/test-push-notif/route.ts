import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function GET() {
  try {
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

    // Get all push subscriptions
    const { data: tokens, error } = await supabase
      .from('notification_tokens')
      .select('device_token, user_id')

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ 
        error: 'No subscriptions found in database',
        total: 0
      }, { status: 404 })
    }

    console.log(`Found ${tokens.length} subscription(s) in database`)

    // Send simple test push to all devices
    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          const subscription = JSON.parse(token.device_token)
          
          // Send simple text message (not JSON)
          await webpush.sendNotification(
            subscription,
            "Test notification from DevTools"
          )
          
          return { success: true, userId: token.user_id }
        } catch (error: unknown) {
          console.error('Error sending to device:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return { success: false, error: errorMessage, userId: token.user_id }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: 'Test push sent to all subscriptions',
      sent: successful,
      failed: failed,
      total: tokens.length,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Failed' })
    })
  } catch (error: unknown) {
    console.error('Test push error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to send test push',
      details: errorMessage 
    }, { status: 500 })
  }
}
