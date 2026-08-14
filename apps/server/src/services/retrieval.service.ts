import { embeddings } from "@ai/embeddings/embeddings";
import { searchVideoChunks } from "@repository/video-chunk.repository";

/**
 * retrieve relevant chunks
 * @param videoId video id
 * @param question question
 * @param limit limit
 * @returns video chunks
 */
export async function retrieveRelevantChunks(
  videoId: string,
  question: string,
  limit = 5,
) {
  const queryEmbedding = await embeddings.embedQuery(question);

  if (queryEmbedding.length !== 384) {
    throw new Error(
      `Invalid query embedding dimensions: expected 384, got ${queryEmbedding.length}`,
    );
  }

  return searchVideoChunks(
    videoId,
    queryEmbedding,
    limit,
  );
}