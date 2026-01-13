import { createClient } from "@/utils/supabase/client";

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ url: string | null; path: string | null; error: Error | null }> {
  const supabase = createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `${fileName}`;

  // Delete old avatar if exists
  await supabase.storage.from("avatars").remove([filePath]);

  // Upload new file
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Avatar upload error:", error);
    return { url: null, path: null, error };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(data.path);

  return { url: publicUrl, path: data.path, error: null };
}

export async function uploadImage(
  file: File,
  folder: "found-items" | "lost-items" | "avatars"
): Promise<string> {
  const supabase = createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const fileName = `${folder}/${timestamp}-${randomString}.${fileExt}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from("items")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Image upload error:", error);
    throw new Error(error.message);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("items").getPublicUrl(data.path);

  return publicUrl;
}

export async function uploadItemImage(
  file: File,
  userId: string,
  itemType: "lost" | "found"
): Promise<{ url: string | null; path: string | null; error: Error | null }> {
  const supabase = createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const fileName = `${itemType}/${userId}-${timestamp}.${fileExt}`;
  const filePath = fileName;

  // Upload file
  const { data, error } = await supabase.storage
    .from("items")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Item image upload error:", error);
    return { url: null, path: null, error };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("items").getPublicUrl(data.path);

  return { url: publicUrl, path: data.path, error: null };
}

export async function deleteImage(
  bucket: "avatars" | "items",
  filePath: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error("Image delete error:", error);
  }

  return { error };
}

export function getImageUrl(
  bucket: "avatars" | "items",
  path: string | null
): string | null {
  if (!path) return null;

  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
