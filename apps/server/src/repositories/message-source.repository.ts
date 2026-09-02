import db from "@db";
import { eq } from "drizzle-orm";
import { messageSources, videoChunks } from "@db/schema";

/**
 * Creates new message sources
 * 
 * @param messageId - Message ID of user message
 * @param videoChunkIds - Array of video chunk IDs retrieved from RAG
 * @returns Array of created message sources
 */
export async function createMessageSources(
  messageId: string,
  videoChunkIds: string[],
) {
  if (videoChunkIds.length === 0) {
    return [];
  }

  return db
    .insert(messageSources)
    .values(
      videoChunkIds.map((videoChunkId) => ({
        messageId,
        videoChunkId,
      })),
    )
    .returning();
}

/**
 * Retrieves all message sources for a specific message
 * 
 * @param messageId - Message ID of the user message
 * @returns Array of message sources
 */
export async function findMessageSources(
  messageId: string,
) {
  return db
    .select({
      id: messageSources.id,
      videoChunkId: videoChunks.id,
      content: videoChunks.content,
      startTime: videoChunks.startTime,
      endTime: videoChunks.endTime,
    })
    .from(messageSources)
    .innerJoin(
      videoChunks,
      eq(
        messageSources.videoChunkId,
        videoChunks.id,
      ),
    )
    .where(
      eq(messageSources.messageId, messageId),
    );
}