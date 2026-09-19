import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";

// promisify execFile to use it with async/await
const execFileAsync = promisify(execFile);

const AUDIO_CHUNK_DURATION = 10 * 60; // 10 minutes
const AUDIO_CHUNK_OVERLAP = 3; // 3 seconds

export interface AudioChunk {
  filePath: string;
  startTime: number;
  duration: number;
}

interface SplitAudioOptions {
  outputDir: string;
}

/**
 * Get the duration of a video/media file using ffprobe
 * @param mediaPath - Path to the video or media file
 * @returns The duration of the media file in seconds
 */
async function getMediaDuration(mediaPath: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    mediaPath,
  ]);

  const duration = Number.parseFloat(stdout.trim());

  if (!Number.isFinite(duration)) {
    throw new Error("Unable to determine media duration");
  }

  return duration;
}

/**
 * Extract audio chunks directly from a video file in 10-minute segments with 3-second overlap
 * @param videoPath - Path to the video file
 * @param duration - Duration of the video file in seconds
 * @param options - Options for splitting the audio chunks
 * @returns Array of AudioChunk objects
 */
async function extractAudioChunksFromVideo(
  videoPath: string,
  duration: number,
  options: SplitAudioOptions,
): Promise<AudioChunk[]> {
  await fs.mkdir(options.outputDir, {
    recursive: true,
  });

  const audioChunks: AudioChunk[] = [];

  let startTime = 0;
  let index = 0;

  while (startTime < duration) {
    const remainingDuration = duration - startTime;

    const chunkDuration = Math.min(
      AUDIO_CHUNK_DURATION,
      remainingDuration,
    );

    const outputPath = path.join(
      options.outputDir,
      `chunk-${index}.wav`,
    );

    await execFileAsync("ffmpeg", [
      "-ss",
      String(startTime),

      "-i",
      videoPath,

      "-t",
      String(chunkDuration),

      // Disable video stream and convert audio to transcription model format
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "pcm_s16le",

      "-y",
      outputPath,
    ]);

    audioChunks.push({
      filePath: outputPath,
      startTime,
      duration: chunkDuration,
    });

    if (startTime + chunkDuration >= duration) {
      break;
    }

    // Move forward by chunk duration minus overlap.
    startTime += AUDIO_CHUNK_DURATION - AUDIO_CHUNK_OVERLAP;
    index++;
  }

  return audioChunks;
}

/**
 * Prepare audio chunks for processing by extracting audio chunks directly from the video file
 * @param videoPath - Path to the video file
 * @param outputDir - Directory to store the audio chunks
 * @returns Array of AudioChunk objects
 */
export async function prepareAudioChunks(
  videoPath: string,
  outputDir: string,
): Promise<AudioChunk[]> {
  await fs.mkdir(outputDir, {
    recursive: true,
  });

  const duration = await getMediaDuration(videoPath);

  const audioChunks = await extractAudioChunksFromVideo(
    videoPath,
    duration,
    {
      outputDir,
    },
  );

  return audioChunks;
}
