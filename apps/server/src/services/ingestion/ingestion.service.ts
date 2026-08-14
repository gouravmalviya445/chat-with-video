import { getYouTubeTranscript } from "./youtube.service";
import { createChunks } from "./chunking.service";
import { indexVideoChunks } from "../video-indexing.service";


/**
 * Ingest youtube video to store its metadata along with vector embeddings of its chunks in pg-vector
 * @param videoId video_id of uploaded video
 * @param youtubeUrl video_url of uploaded video
 * @returns metadata of video along with number of chunks and segments
 */
export async function ingestYouTubeVideo(
  videoId: string,
  youtubeUrl: string,
) {
  // step 1 -> Get video transcript
  const transcript = await getYouTubeTranscript(youtubeUrl);

  if (transcript.length === 0) {
    throw new Error(
      "No transcript found for this video",
    );
  }

  // step 2 -> Create timestamp-aware chunks
  const chunks = createChunks(transcript);

  if (chunks.length === 0) {
    throw new Error(
      "Unable to create chunks from transcript",
    );
  }

  // step 3 -> generate embeddings of chunks and store it in DB
  const indexedChunks = await indexVideoChunks(videoId, chunks);

  return {
    transcriptSegments: transcript.length,
    chunks: indexedChunks.length,
  };
}