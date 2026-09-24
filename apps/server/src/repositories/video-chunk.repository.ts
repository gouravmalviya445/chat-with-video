import db from "@db";
import { videoChunks } from "@db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * insert video chunk
 * @param data video chunk data
 * @returns video chunk
 */
// export async function createVideoChunk(data: {
//   videoId: string;
//   chunkIndex: number;
//   content: string;
//   startTime: number;
//   endTime: number;
//   tokenCount?: number;
//   embedding?: number[];
// }) {
//   const [chunk] = await db
//     .insert(videoChunks)
//     .values({
//       videoId: data.videoId,
//       chunkIndex: data.chunkIndex,
//       content: data.content,
//       startTime: data.startTime,
//       endTime: data.endTime,
//       tokenCount: data.tokenCount,
//       embedding: data.embedding,
//     })
//     .returning();

//   return chunk;
// }

/**
 * insert multiple video chunks
 * @param chunks video chunk data
 * @returns video chunks
 */
export async function createVideoChunks(
  chunks: Array<{
    videoId: string;
    chunkIndex: number;
    content: string;
    startTime: number;
    endTime: number;
    tokenCount?: number;
    embedding: number[];
  }>,
) {
  if (chunks.length === 0) {
    return [];
  }

  const videoId = chunks[0]?.videoId;

  if (!videoId) {
    throw new Error("videoId is required");
  }

  return db.transaction(async (tx) => {
    await tx
      .delete(videoChunks)
      .where(eq(videoChunks.videoId, videoId));

    return tx
      .insert(videoChunks)
      .values(chunks)
      .returning();
  });
}

/**
 *  search video chunks by embedding similarity
 * @param videoId video id
 * @param embedding embedding vector
 * @param limit limit
 * @returns video chunks
 */
export async function searchVideoChunks({
  videoId,
  embedding,
  limit = 5,
}: {
  videoId: string;
  embedding: number[];
  limit?: number;
}) {
  const vector = `[${embedding.join(",")}]`;

  const res = await db.execute(sql`
    SELECT
      id,
      video_id,
      content,
      start_time,
      end_time,
      chunk_index,
      1 - (
        embedding <=> ${vector}::vector
      ) AS similarity
    FROM video_chunks
    WHERE video_id = ${videoId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit};
  `);

  return res?.rows as unknown as Array<{
    id: string;
    videoId: string;
    content: string;
    startTime: number;
    endTime: number;
    chunkIndex: number;
    similarity: number;
  }>;
}