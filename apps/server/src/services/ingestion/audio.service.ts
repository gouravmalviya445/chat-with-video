import path from "node:path";
import fs from "node:fs/promises";
import ffmpeg from "fluent-ffmpeg";

const AUDIO_CHUNK_DURATION = 10 * 60; // 10 minutes

export interface AudioChunk {
  filePath: string;
  startTime: number;
  duration: number;
}

/**
 * Calculates exact audio duration using ffprobe.
 * @param filePath path to audio file
 * @returns duration in seconds
 */
async function getAudioDuration(
  audioPath: string,
): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(
      audioPath,
      (error, metadata) => {
        if (error) {
          reject(error);
          return;
        }

        const duration = metadata.format.duration;

        if (
          typeof duration !== "number" ||
          !Number.isFinite(duration)
        ) {
          reject(
            new Error(
              `Unable to determine audio duration for ${audioPath}`,
            ),
          );
          return;
        }

        resolve(duration);
      },
    );
  });
}

/**
 * Prepares audio chunks from a video URL.
 * @param videoUrl URL of the video file
 * @param outputDir Directory to store audio chunks
 * @returns Array of AudioChunk objects
 */
export async function prepareAudioChunks(
  videoUrl: string,
  outputDir: string,
): Promise<AudioChunk[]> {
  await fs.mkdir(outputDir, {
    recursive: true,
  });

  return new Promise((resolve, reject) => {
    ffmpeg(videoUrl)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioChannels(1)
      .audioFrequency(16000)
      .audioBitrate("64k")
      .format("segment")
      .outputOptions([
        `-segment_time ${AUDIO_CHUNK_DURATION}`,
        "-segment_start_number 0",
        "-reset_timestamps 1",
      ])
      .output(
        path.join(outputDir, "chunk-%03d.mp3"),
      )
      .on("start", (commandLine) => {
        console.log(
          `[FFmpeg] Starting: ${commandLine}`,
        );
      })
      .on("error", (error, stdout, stderr) => {
        console.error("[FFmpeg] Error:", error);
        console.error("[FFmpeg] stderr:", stderr);

        reject(error);
      })
      .on("end", async () => {
        try {
          const files = (
            await fs.readdir(outputDir)
          )
            .filter((file) =>
              /^chunk-\d+\.mp3$/.test(file),
            )
            .sort();

          const chunks: AudioChunk[] = [];

          let startTime = 0;

          for (const file of files) {
            const filePath = path.join(
              outputDir,
              file,
            );

            const duration =
              await getAudioDuration(filePath);

            chunks.push({
              filePath,
              startTime,
              duration,
            });

            startTime += duration;
          }

          resolve(chunks);
        } catch (error) {
          reject(error);
        }
      })
      .run();
  });
}
