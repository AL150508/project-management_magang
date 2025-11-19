import webpush from 'web-push'

// Configure web-push dengan VAPID keys dari .env
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: {
    title: string
    body: string
    icon?: string
    data?: any
  }
) {
  try {
    await webpush.sendNotification(
      subscription as any,
      JSON.stringify(payload)
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error }
  }
}