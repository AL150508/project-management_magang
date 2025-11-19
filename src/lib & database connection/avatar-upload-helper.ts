import { supabaseBrowser } from "./supabase-browser"

export interface UploadAvatarResult {
  url: string
  path: string
}

/**
 * Upload avatar to Supabase storage
 * @param blob - Cropped image blob
 * @param userId - User ID for file naming
 * @returns Avatar URL and storage path
 */
export async function uploadAvatar(
  blob: Blob,
  userId: string
): Promise<UploadAvatarResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${userId}-${timestamp}.webp`
    const filePath = `avatars/${fileName}`

    // Check if Supabase is configured
    if (!supabaseBrowser) {
      throw new Error("Supabase is not configured")
    }

    // Upload to Supabase storage
    const { data, error } = await supabaseBrowser.storage
      .from("avatars")
      .upload(filePath, blob, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseBrowser.storage.from("avatars").getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error: any) {
    console.error("Error uploading avatar:", error)
    // Throw actual error with details for debugging
    throw error instanceof Error ? error : new Error(JSON.stringify(error))
  }
}

/**
 * Delete old avatar from storage
 * @param path - Storage path of avatar to delete
 */
export async function deleteAvatar(path: string): Promise<void> {
  try {
    if (!supabaseBrowser) {
      throw new Error("Supabase is not configured")
    }

    const { error } = await supabaseBrowser.storage.from("avatars").remove([path])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error deleting avatar:", error)
    // Don't throw - old avatar deletion is not critical
  }
}

/**
 * Update user avatar URL in database
 * @param userId - User ID
 * @param avatarUrl - New avatar URL
 */
export async function updateUserAvatar(
  userId: string,
  avatarUrl: string
): Promise<void> {
  try {
    if (!supabaseBrowser) {
      throw new Error("Supabase is not configured")
    }

    // Update avatar in database with timestamp
    const { error: updateError } = await supabaseBrowser
      .from("users")
      .update({ 
        avatar: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Update error:", updateError)
      throw updateError
    }

    // Verify the update was successful
    const { data: verifyData, error: verifyError } = await supabaseBrowser
      .from("users")
      .select("avatar")
      .eq("id", userId)
      .single()

    if (verifyError) {
      console.error("Verification error:", verifyError)
      throw new Error("Failed to verify avatar update")
    }

    if (verifyData?.avatar !== avatarUrl) {
      console.error("Avatar mismatch! Expected:", avatarUrl, "Got:", verifyData?.avatar)
      throw new Error("Avatar update verification failed")
    }

    console.log("✅ Avatar updated and verified:", avatarUrl)
  } catch (error) {
    console.error("Error updating user avatar:", error)
    throw error instanceof Error ? error : new Error("Failed to update user avatar")
  }
}