-- Create HNSW index for faster similarity search --
CREATE INDEX "video_chunks_embedding_idx"
ON "video_chunks"
USING hnsw ("embedding" vector_cosine_ops);