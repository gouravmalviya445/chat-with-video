import { VECTOR_DIMENSIONS } from "@/constants";
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

  if (queryEmbedding.length !== VECTOR_DIMENSIONS) {
    throw new Error(
      `Invalid query embedding dimensions: expected ${VECTOR_DIMENSIONS}, got ${queryEmbedding.length}`,
    );
  }

  return searchVideoChunks({
    videoId: videoId,
    embedding: queryEmbedding,
    limit: limit,
  });
}