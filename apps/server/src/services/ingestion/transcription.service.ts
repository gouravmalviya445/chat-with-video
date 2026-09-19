import fs from "node:fs/promises";

import type { AudioChunk } from "./audio.service";
import type { TranscriptSegment } from "./types";
import { generateTranscription } from "@/ai/llm/transcribe";

/**
 * Helper to group individual word-level segments into 3-5 second transcript chunks.
 *
 * @param wordSegments Array of word-level segments returned by Vercel AI SDK
 * @param targetDuration Target chunk duration in seconds (default: 4.0 seconds)
 * @param maxPauseDuration Split chunk if pause between words exceeds this threshold (default: 0.8s)
 */
export function groupWordSegmentsIntoChunks(
  wordSegments: Array<{ text: string; startSecond: number; endSecond: number }>,
  targetDuration = 4.0,
  maxPauseDuration = 0.8,
): TranscriptSegment[] {
  if (wordSegments.length === 0) return [];

  const chunks: TranscriptSegment[] = [];
  let currentWords: string[] = [];
  let startTime = wordSegments?.[0]?.startSecond ?? 0;
  let lastEndTime = wordSegments?.[0]?.startSecond ?? 0;

  // Group individual word-level segments into 3-5 second transcript chunks.
  for (const word of wordSegments) {
    const wordText = word.text.trim();
    if (!wordText) continue;

    const currentDuration = word.endSecond - startTime;
    const pauseDuration = word.startSecond - lastEndTime;
    const isSentenceEnd = /[.!?।]$/.test(wordText);

    // Split chunk if:
    // - Current words length > 0
    // - Current duration >= target duration (4.0s)
    // - Pause duration >= max pause duration (0.8s)
    // - Sentence end detected AND current duration >= 2.0s
    const shouldSplit =
      (currentWords.length > 0 && currentDuration >= targetDuration) ||
      (currentWords.length > 0 && pauseDuration >= maxPauseDuration) ||
      (currentWords.length > 0 && isSentenceEnd && currentDuration >= 2.0);

    // Push the current chunk and start a new one if split condition is met
    if (shouldSplit) {
      chunks.push({
        text: currentWords.join(" "),
        startTime,
        endTime: lastEndTime,
      });

      // start new chunk with current word
      currentWords = [wordText];
      startTime = word.startSecond;
    } else {
      // start new chunk if current words is empty
      if (currentWords.length === 0) {
        startTime = word.startSecond;
      }
      currentWords.push(wordText);
    }
    lastEndTime = word.endSecond;
  }

  if (currentWords.length > 0) {
    chunks.push({
      text: currentWords.join(" "),
      startTime,
      endTime: lastEndTime,
    });
  }

  return chunks;
}

/**
 * Transcribes the audio chunk using the transcription model from AI SDK
 * @param chunk - audio chunk to be transcribed
 * @returns - promise of array of transcript segments (grouped into 3-5 second chunks)
 */
export async function transcribeAudioChunk(
  chunk: AudioChunk,
): Promise<TranscriptSegment[]> {
  const audioBuffer = await fs.readFile(chunk.filePath);

  const result = await generateTranscription(audioBuffer);
  const segments = groupWordSegmentsIntoChunks(
    result.segments,
    4.0,
  );

  return segments.map((segment) => ({
    ...segment,
    startTime: segment.startTime + chunk.startTime,
    endTime: segment.endTime + chunk.startTime,
  }));
}
