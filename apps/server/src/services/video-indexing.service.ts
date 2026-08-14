import { embeddings } from "@ai/embeddings/embeddings";
import { createVideoChunks } from "@repository/video-chunk.repository";

interface IndexableChunk {
  content: string;
  startTime: number;
  endTime: number;
  tokenCount?: number;
}

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
    if (vector.length !== 384) {
      throw new Error(
        `Invalid embedding dimensions: expected 384, got ${vector.length}`,
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