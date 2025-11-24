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

    console.log("📤 Uploading avatar:", { fileName, userId, blobSize: blob.size })

    // Note: Bucket 'avatars' should be created manually in Supabase dashboard
    // with proper RLS policies. We skip auto-creation to avoid permission errors.

    // Upload to Supabase storage
    const { data, error } = await supabaseBrowser.storage
      .from("avatars")
      .upload(filePath, blob, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("❌ Upload error details:", error)
      
      // Provide specific error messages
      if (error.message?.includes('new row violates row-level security policy')) {
        throw new Error("Permission denied: Anda tidak memiliki izin untuk upload foto. Hubungi administrator.")
      } else if (error.message?.includes('Bucket not found')) {
        throw new Error("Storage bucket 'avatars' tidak ditemukan. Hubungi administrator.")
      } else if (error.message?.includes('The resource already exists')) {
        // Try with upsert if file exists
        console.log("⚠️ File exists, retrying with upsert...")
        const { error: retryError } = await supabaseBrowser.storage
          .from("avatars")
          .upload(filePath, blob, {
            contentType: "image/webp",
            cacheControl: "3600",
            upsert: true, // Overwrite existing file
          })
        
        if (retryError) {
          throw retryError
        }
      } else {
        throw error
      }
    }

    console.log("✅ Upload successful:", data)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseBrowser.storage.from("avatars").getPublicUrl(filePath)

    console.log("✅ Public URL generated:", publicUrl)

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error: unknown) {
    console.error("❌ Error uploading avatar:", error)
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

    console.log("✅ Avatar updated successfully:", avatarUrl)
  } catch (error) {
    console.error("Error updating user avatar:", error)
    throw error instanceof Error ? error : new Error("Failed to update user avatar")
  }
}