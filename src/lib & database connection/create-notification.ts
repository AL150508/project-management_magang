/**
 * Create In-App Notification Helper
 * 
 * PENTING: Ini adalah IN-APP NOTIFICATION (bell icon)
 * BUKAN Push Notification (Windows notification)
 * 
 * Digunakan untuk membuat notifikasi yang muncul di bell icon
 * ketika guru membuka aplikasi.
 */

import { supabaseBrowser } from "./supabase-browser"

interface CreateNotificationParams {
  // Target user (biasanya guru)
  userId: string
  userRole: "guru" | "siswa"
  
  // Notification content
  title: string
  message: string
  type: "logbook" | "magang" | "dudi" | "approval" | "rejection"
  
  // Optional
  referenceId?: string
  referenceTable?: string
  senderName?: string
  senderId?: string
  actionUrl?: string
}

/**
 * Create a new in-app notification
 * 
 * Example usage:
 * ```ts
 * await createNotification({
 *   userId: guruId,
 *   userRole: "guru",
 *   title: "Logbook Baru Dikirim",
 *   message: "Ahmad Rizki telah mengirim logbook baru pada tanggal 21/11/2025",
 *   type: "logbook",
 *   senderName: "Ahmad Rizki",
 *   actionUrl: "/logbook"
 * })
 * ```
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    if (!supabaseBrowser) {
      console.error("❌ Supabase client not initialized")
      return { success: false, error: "Supabase not initialized" }
    }

    console.log("🔔 Creating in-app notification:", params.title)

    const { data, error } = await supabaseBrowser
      .from("notifications")
      .insert({
        user_id: params.userId,
        user_role: params.userRole,
        title: params.title,
        message: params.message,
        type: params.type,
        reference_id: params.referenceId,
        reference_table: params.referenceTable,
        sender_name: params.senderName,
        sender_id: params.senderId,
        action_url: params.actionUrl,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Error creating notification:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ In-app notification created successfully:", data.id)
    return { success: true, data }
  } catch (err) {
    console.error("❌ Exception creating notification:", err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    }
  }
}

/**
 * Create notification for all users with specific role
 * 
 * Example: Notify all guru when siswa submits logbook
 */
export async function createNotificationForRole(
  role: "guru" | "siswa",
  params: Omit<CreateNotificationParams, "userId" | "userRole">
) {
  try {
    if (!supabaseBrowser) {
      console.error("❌ Supabase client not initialized")
      return { success: false, error: "Supabase not initialized" }
    }

    console.log(`🔔 Creating in-app notifications for all ${role}`)
    console.log("📝 Notification params:", params)

    // Get all users with specific role
    const { data: users, error: userError } = await supabaseBrowser
      .from("users")
      .select("id, email, full_name")
      .eq("role", role)

    if (userError) {
      console.error("❌ Error fetching users:", userError)
      return { success: false, error: userError.message }
    }

    console.log(`👥 Found ${users?.length || 0} users with role ${role}:`, users)

    if (!users || users.length === 0) {
      console.log(`⚠️ No users found with role: ${role}`)
      return { success: true, count: 0 }
    }

    // Create notification for each user
    const notifications = users.map((user) => ({
      user_id: user.id,
      user_role: role,
      title: params.title,
      message: params.message,
      type: params.type,
      reference_id: params.referenceId || null,
      reference_table: params.referenceTable || null,
      sender_name: params.senderName || null,
      sender_id: params.senderId || null,
      action_url: params.actionUrl || null,
      is_read: false,
    }))

    console.log("📤 Inserting notifications:", notifications)

    const { data, error } = await supabaseBrowser
      .from("notifications")
      .insert(notifications)
      .select()

    if (error) {
      console.error("❌ Error creating notifications:", error)
      console.error("❌ Error details:", JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    console.log(`✅ Created ${data.length} in-app notifications for ${role}`)
    console.log("✅ Notification data:", data)
    return { success: true, count: data.length, data }
  } catch (err) {
    console.error("❌ Exception creating notifications:", err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    }
  }
}

/**
 * Create notification for ALL users (ignore role filtering)
 * This mirrors createNotificationForRole but selects every user.
 */
export async function createNotificationForAll(
  params: Omit<CreateNotificationParams, "userId" | "userRole">
) {
  try {
    if (!supabaseBrowser) {
      console.error("❌ Supabase client not initialized")
      return { success: false, error: "Supabase not initialized" }
    }

    console.log("🔔 Creating in-app notifications for ALL users")
    console.log("📝 Notification params:", params)

    // Get all users (any role)
    const { data: users, error: userError } = await supabaseBrowser
      .from("users")
      .select("id, role")

    if (userError) {
      console.error("❌ Error fetching users:", userError)
      return { success: false, error: userError.message }
    }

    const count = users?.length || 0
    console.log(`👥 Found ${count} users (all roles)`)    

    if (!users || users.length === 0) {
      return { success: true, count: 0 }
    }

    const notifications = users.map((user) => ({
      user_id: user.id,
      user_role: (user.role === 'guru' ? 'guru' : 'siswa') as 'guru' | 'siswa',
      title: params.title,
      message: params.message,
      type: params.type,
      reference_id: params.referenceId || null,
      reference_table: params.referenceTable || null,
      sender_name: params.senderName || null,
      sender_id: params.senderId || null,
      action_url: params.actionUrl || null,
      is_read: false,
    }))

    console.log("📤 Inserting notifications for ALL users (", notifications.length, ")")

    const { data, error } = await supabaseBrowser
      .from("notifications")
      .insert(notifications)
      .select()

    if (error) {
      console.error("❌ Error creating notifications:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Created ${data.length} in-app notifications for ALL users`)
    return { success: true, count: data.length, data }
  } catch (err) {
    console.error("❌ Exception creating notifications (ALL):", err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    }
  }
}
