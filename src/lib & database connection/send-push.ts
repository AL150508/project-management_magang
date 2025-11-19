/**
 * Helper functions untuk mengirim push notification
 */

/**
 * Kirim push notification ke semua user dengan role tertentu
 */
export async function sendPushToRole(
  role: 'guru' | 'siswa',
  notification: {
    title: string
    body: string
    icon?: string
    url?: string
  }
): Promise<{ success: boolean; sent?: number; error?: string }> {
  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole: role,
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        url: notification.url || '/'
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Push sent to ${result.sent} ${role}(s)`)
    } else {
      console.error('❌ Push failed:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('Error sending push:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Kirim push notification ke user tertentu berdasarkan userId
 */
export async function sendPushToUser(
  userId: string,
  notification: {
    title: string
    body: string
    icon?: string
    url?: string
  }
): Promise<{ success: boolean; sent?: number; error?: string }> {
  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        url: notification.url || '/'
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Push sent to user ${userId}`)
    } else {
      console.error('❌ Push failed:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('Error sending push:', error)
    return { success: false, error: String(error) }
  }
}