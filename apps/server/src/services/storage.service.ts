import { supabase } from "@/lib/supabase";
import { env } from "@/config/env";
import createHttpError from "http-errors";

/**
 * Creates a signed URL for uploading a video file to Supabase Storage.
 * 
 * @param path - Path of the file in the bucket (e.g., "public/video.mp4")
 * @returns Object containing the file path and the signed upload token
 */
export async function createVideoUploadUrl(
  path: string,
) {
  const { data, error } = await supabase.storage
    .from(env?.SUPABASE_STORAGE_BUCKET!)
    .createSignedUploadUrl(path);

  if (error) {
    throw createHttpError(500, `Failed to create upload URL: ${error.message}`);
  } 

  return {
    path,
    token: data.token,
  };
}

/**
 * Generates the storage path for a video file.
 * 
 * @param userId - The ID of the user who owns the video
 * @param videoId - The ID of the video
 * @returns The storage path for the video
 */
export function getVideoStoragePath(
  userId: string,
  videoId: string,
) {
  return `videos/${userId}/${videoId}/original.mp4`;
}