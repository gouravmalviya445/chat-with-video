import { eq } from "drizzle-orm";

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
 * find video by id
 * @param videoId id of video to be fetched
 * @returns video or null
 */
export async function findVideoById(
  videoId: string,
) {
  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.id, videoId))
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