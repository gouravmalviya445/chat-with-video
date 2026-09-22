import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import os from "os";

const AUDIO_CHUNK_DURATION = 10 * 60; // 10 minutes

export interface AudioChunk {
  filePath: string;
  startTime: number;
  duration: number;
}

/**
 * Saves incoming unseekable Readable stream to a temporary local file.
 * @param inputStream stream of video file
 * @param tempFilePath path to temporary file
 * @returns Promise void
 */
async function saveStreamToTempFile(
  inputStream: Readable,
  tempFilePath: string
): Promise<void> {
  const writeStream = createWriteStream(tempFilePath);
  await pipeline(inputStream, writeStream);
}

/**
 * Splits disk-backed video file into fixed-duration WAV audio chunks.
 * @param inputFile path to video file
 * @param outputDir directory to store audio chunks
 * @param chunkDurationSeconds duration of each audio chunk in seconds
 * @returns Promise void
 */
async function extractAudioSegments(
  inputFile: string,
  outputDir: string,
  chunkDurationSeconds: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputPattern = path.join(outputDir, "chunk-%03d.wav");

    const ffmpeg = spawn("ffmpeg", [
      "-y",                      // 
      "-i", inputFile,
      "-vn",                     // Strip video streams
      "-acodec", "pcm_s16le",    // Standard 16-bit PCM WAV
      "-ar", "16000",            // 16kHz sample rate (Optimal for STT/Whisper)
      "-ac", "1",                // Mono audio channel
      "-f", "segment",           // Segment muxer
      "-segment_time", String(chunkDurationSeconds),
      "-reset_timestamps", "1",  // Reset timestamps for each chunk from 0
      outputPattern,
    ]);

    let stderr = "";

    ffmpeg.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    ffmpeg.on("error", reject);

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg segmenting failed with code ${code}: ${stderr}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Calculates exact audio duration using ffprobe.
 * @param filePath path to audio file
 * @returns duration in seconds
 */
async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let stdout = "";
    let stderr = "";

    ffprobe.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    ffprobe.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    ffprobe.on("error", reject);

    ffprobe.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed with code ${code}: ${stderr}`));
        return;
      }

      const duration = Number.parseFloat(stdout.trim());
      if (!Number.isFinite(duration)) {
        reject(new Error(`Invalid duration value obtained for ${filePath}`));
        return;
      }

      resolve(duration);
    });
  });
}

/**
 * Streams video, buffers it to a temp file, segments audio with FFmpeg,
 * and returns timed metadata for each chunk.
 * @param videoStream Unseekable stream of video file
 * @param outputDir Directory to store audio chunks
 * @param chunkDurationSeconds Duration of each audio chunk in seconds
 * @returns Array of AudioChunk objects
 */
export async function prepareAudioChunks(
  videoStream: Readable,
  outputDir: string,
  chunkDurationSeconds: number = AUDIO_CHUNK_DURATION,
): Promise<AudioChunk[]> {
  await fs.mkdir(outputDir, { recursive: true });

  const tempVideoDir = await fs.mkdtemp(
    path.join(os.tmpdir(), `video_${Date.now()}`)
  );
  const tempVideoFilePath = path.join(
    tempVideoDir,
    "input_video.tmp"
  );
  console.info("Temp video file path:", tempVideoFilePath);

  try {
    // Phase 1: Stream to temp file buffer to make video seekable
    await saveStreamToTempFile(videoStream, tempVideoFilePath);

    // Phase 2: Execute segment processing via FFmpeg
    await extractAudioSegments(tempVideoFilePath, outputDir, chunkDurationSeconds);

    // Phase 3: Collect generated chunks and compute time ranges
    const dirEntries = await fs.readdir(outputDir);
    const chunkFiles = dirEntries
      .filter((file) => /^chunk-\d+\.wav$/.test(file))
      .sort();

    const audioChunks: AudioChunk[] = [];
    let currentTimeOffset = 0;

    // Compute offsets for all chunks
    for (const file of chunkFiles) {
      const filePath = path.join(outputDir, file);
      const duration = await getAudioDuration(filePath);

      audioChunks.push({
        filePath,
        startTime: currentTimeOffset,
        duration,
      });

      currentTimeOffset += duration;
    }

    return audioChunks;
  } finally {
    // Cleanup temporary video source file
    await fs.rm(tempVideoDir, {recursive: true, force: true});
    console.info("Temporary video file path cleaned up.")
  }
}
