import { and, desc, eq } from "drizzle-orm";

import db from "@/db";
import { videos } from "@/db/schema";

/**
 * create youtube video in db
 * @param data video data to be inserted
 * @returns created video
 */
export async function createYouTubeVideo(data: {
  userId: string;
  title: string;
  youtubeUrl: string;
}) {
  const [video] = await db
    .insert(videos)
    .values({
      userId: data.userId,
      title: data.title,
      youtubeUrl: data.youtubeUrl,
      status: "PENDING",
    })
    .returning();

  return video;
}

/**
 * Find a video by ID belonging to a specific user.
 * @param videoId ID of the video to be fetched
 * @param userId ID of the authenticated user
 * @returns video or undefined
 */
export async function findVideoById(
  videoId: string,
  userId: string,
) {
  const [video] = await db
    .select()
    .from(videos) 
    .where(
      and(
        eq(videos.id, videoId),
        eq(videos.userId, userId),
      ),
    )
    .limit(1);

  return video;
}

/**
 * update status of video
 * @param videoId id of video to be updated
 * @param status status to be updated
 * @returns updated video
 */
export async function updateVideoStatus(
  videoId: string,
  status:
    | "PENDING"
    | "PROCESSING"
    | "READY"
    | "FAILED",
) {
  const [video] = await db
    .update(videos)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(videos.id, videoId))
    .returning();

  return video;
}

/**
 * delete video from db only the authenticated user can delete his own video
 * @param videoId id of video to be deleted
 * @param userId user id of the video owner
 * @returns deleted video
 */
export async function deleteVideoById(
  videoId: string,
  userId: string
) {
  const [video] = await db
    .delete(videos)
    .where(
      and(
        eq(videos.id, videoId),
        eq(videos.userId, userId),
      ),
    )
    .returning();
  return video;
}

/**
 * Gets all videos belonging to the authenticated user.
 * @param userId authenticated user's ID
 * @param limit number of videos to be fetched
 * @param offset number of videos to skip
 * @returns array of videos
 */
export async function getAllVideos(
  userId: string,
  limit: number = 10,
  offset: number = 0,
) {
  return await db
    .select()
    .from(videos)
    .where(eq(videos.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(videos.createdAt));
}