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
 * Extract audio from video file using ffmpeg
 * @param videoPath - Path to the video file
 * @param audioPath - Path to store the extracted audio
 */
async function extractAudio(
  videoPath: string,
  audioPath: string,
): Promise<void> {
  await execFileAsync("ffmpeg", [
    "-i",
    videoPath,

    // Convert to a Whisper-friendly format.
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-c:a",
    "pcm_s16le",

    "-y",
    audioPath,
  ]);
}

/**
 * Get the duration of an audio file using ffprobe
 * @param audioPath - Path to the audio file
 * @returns The duration of the audio file in seconds
 */
async function getAudioDuration(audioPath: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    audioPath,
  ]);

  const duration = Number.parseFloat(stdout.trim());

  if (!Number.isFinite(duration)) {
    throw new Error("Unable to determine audio duration");
  }

  return duration;
}


/**
 * Split audio into chunks of 10 minutes with 3 seconds overlap
 * @param audioPath - Path to the audio file
 * @param duration - Duration of the audio file in seconds
 * @param options - Options for splitting the audio
 * @returns Array of AudioChunk objects
 */
async function splitAudio(
  audioPath: string,
  duration: number,
  options: SplitAudioOptions,
): Promise<AudioChunk[]> {
  await fs.mkdir(options.outputDir, {
    recursive: true,
  });

  const chunks: AudioChunk[] = [];

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
      audioPath,

      "-t",
      String(chunkDuration),

      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "pcm_s16le",

      "-y",
      outputPath,
    ]);

    chunks.push({
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

  return chunks;
}

/**
 * Prepare audio chunks for processing by extracting audio from video and splitting it into chunks
 * @param videoPath - Path to the video file
 * @param outputDir - Directory to store the audio chunks
 * @returns Array of AudioChunk objects
 */
export async function prepareAudioChunks(
  videoPath: string,
  outputDir: string,
): Promise<AudioChunk[]> {
  const audioPath = path.join(outputDir, "audio.wav");

  await fs.mkdir(outputDir, {
    recursive: true,
  });

  await extractAudio(videoPath, audioPath);

  const duration = await getAudioDuration(audioPath);

  const chunks = await splitAudio(
    audioPath,
    duration,
    {
      outputDir,
    },
  );

  return chunks;
}
