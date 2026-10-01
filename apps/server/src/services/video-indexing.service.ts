import { VECTOR_DIMENSIONS } from "@/constants";
import { embeddings } from "@ai/embeddings/embeddings";
import { createVideoChunks } from "@repository/video-chunk.repository";

interface IndexableChunk {
  content: string;
  startTime: number;
  endTime: number;
  tokenCount?: number;
}

/**
 * Indexes video chunks by creating embeddings for each chunk
 * and then saving them to the database
 * 
 * @param videoId - ID of the video to index
 * @param chunks - array of chunks to index
 * @returns array of created video chunks
 */
export async function indexVideoChunks(
  videoId: string,
  chunks: IndexableChunk[],
) {
  if (chunks.length === 0) {
    return [];
  }

  // get content from each chunk
  const texts = chunks.map((chunk) => chunk.content);

  // create embeddings of texts
  const vectors = await embeddings.embedDocuments(texts);

  // check if embedding count is same as chunk count
  if (vectors.length !== chunks.length) {
    throw new Error(
      `Embedding count mismatch: expected ${chunks.length}, got ${vectors.length}`,
    );
  }

  // check if embedding dimensions are same as expected
  for (const vector of vectors) {
    if (vector.length !== VECTOR_DIMENSIONS) {
      throw new Error(
        `Invalid embedding dimensions: expected ${VECTOR_DIMENSIONS}, got ${vector.length}`,
      );
    }
  }

  const records = chunks.map((chunk, index) => ({
    videoId,
    chunkIndex: index,
    content: chunk.content,
    startTime: chunk.startTime,
    endTime: chunk.endTime,
    tokenCount: chunk.tokenCount,
    embedding: vectors[index] as number[],
  }));
  return createVideoChunks(records);
}