import { embeddings } from "@ai/embeddings/embeddings";
import { searchVideoChunks } from "@repository/video-chunk.repository";

/**
 * retrieve relevant chunks
 * @param videoId video id
 * @param question question
 * @param limit limit
 * @returns video chunks
 */
export async function retrieveRelevantChunks({
  videoId,
  question,
  limit = 5,
}: {
  videoId: string;
  question: string;
  limit?: number;
}) {
  const queryEmbedding = await embeddings.embedQuery(question);

  if (queryEmbedding.length !== 384) {
    throw new Error(
      `Invalid query embedding dimensions: expected 384, got ${queryEmbedding.length}`,
    );
  }

  return searchVideoChunks({
    videoId: videoId,
    embedding: queryEmbedding,
    limit: limit,
  });
}