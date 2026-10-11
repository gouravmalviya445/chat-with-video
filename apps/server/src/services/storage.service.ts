import { supabase } from "@/lib/supabase";
import { env } from "@/config/env";
import createHttpError from "http-errors";

const BUCKET_NAME = env?.SUPABASE_STORAGE_BUCKET!;

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
    .from(BUCKET_NAME)
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
 * Checks whether a video object exists in Supabase Storage.
 *
 * This only checks object metadata/listing and does not download
 * the actual video file.
 */
export async function videoObjectExists(
  path: string,
) {
  const lastSlashIndex = path.lastIndexOf("/");

  // extract folder 
  const folder =
    lastSlashIndex === -1
      ? ""
      : path.slice(0, lastSlashIndex);

  // extract file name
  const fileName =
    lastSlashIndex === -1
      ? path
      : path.slice(lastSlashIndex + 1);

  // get file from supabase
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folder, {
      search: fileName,
      limit: 1,
    });

  if (error) {
    throw createHttpError(
      500,
      `Failed to verify uploaded video: ${error.message}`,
    );
  }

  return data.some(
    (file) => file.name === fileName,
  );
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

/**
 * Creates a signed URL for accessing a video file from Supabase Storage.
 * 
 * @param storagePath - The storage path of the video file
 * @returns The signed URL for accessing the video file
 */
export async function createVideoSignedUrl(
  storagePath: string,
  expiresIn: number = 3600 // 1 hour by default
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(
      storagePath,
      expiresIn
    );

  if (error) {
    throw createHttpError(500, `Failed to create signed URL: ${error.message}`);
  }
  
  if (!data?.signedUrl) {
    throw createHttpError(
      500,
      "Supabase did not return a signed video URL",
    );
  }
  
  return data.signedUrl;
}