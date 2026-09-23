import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { getYouTubeTranscript } from "./youtube.service";
import { transcribeAudioChunk } from "./transcription.service";
import type { TranscriptSegment } from "./types";

import { createVideoSignedUrl } from "../storage.service";
import { prepareAudioChunks } from "./audio.service";

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

/**
 * ingest uploaded video to store its metadata along with vector embeddings of its chunks in pg-vector
 * @param videoId id of uploaded video
 * @param storagePath storage path of uploaded video
 * @returns metadata of video along with number of chunks and segments
 */
export async function ingestUploadedVideo(
  videoId: string,
  storagePath: string,
) {
  // step 1 -> Get video signed url from supabase storage
  const signedUrl = await createVideoSignedUrl(storagePath);

  // step 2 -> Create temp directory to store audio chunks
  const outputDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      `video-${videoId}-`,
    ),
  );

  try {
    // step 3 -> Prepare audio chunks from video
    const audioChunks = await prepareAudioChunks(
      signedUrl,
      outputDir,
    );

    if (audioChunks.length === 0) {
      throw new Error(
        "Unable to extract audio chunks from uploaded video",
      );
    }

    // step 4 -> generate transcription from audio chunks
    const transcript: TranscriptSegment[] = [];
    for (const audioChunk of audioChunks) {
      const segments = await transcribeAudioChunk(audioChunk);

      transcript.push(...segments);
    }

    if (transcript.length === 0) {
      throw new Error(
        "No transcript generated from uploaded video",
      );
    }

    // step 5 -> Create timestamp-aware chunks
    const chunks = createChunks(transcript);

    if (chunks.length === 0) {
      throw new Error(
        "Unable to create chunks from transcript",
      );
    }

    // step 6 -> generate embeddings of chunks and store it in DB
    const indexedChunks = await indexVideoChunks(videoId, chunks);
    console.log("indxed chunk", indexedChunks);

    // step 7 -> return number of audio chunks, transcript segments and chunks
    return {
      audioChunks: audioChunks.length,
      transcriptSegments: transcript.length,
      chunks: indexedChunks.length,
    };
  } finally {
    // step 8 -> Remove temp directory
    await fs.rm(outputDir, {
      recursive: true,
      force: true,
    });
  }
}