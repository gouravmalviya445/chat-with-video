import type { TranscriptSegment } from "./types";

export interface VideoChunkInput {
  content: string;
  startTime: number;
  endTime: number;
}

/**
 * Creates chunks from transcript segments
 * @param segments transcript segments with timestamps
 * @returns array of chunks with start and end timestamps
 */
export function createChunks(
  segments: TranscriptSegment[],
): VideoChunkInput[] {

  const chunks: VideoChunkInput[] = [];

  let currentText = ""; // temp text of current chunk
  let currentStart = 0; // staring time of current chunk in seconds
  let currentEnd = 0; // ending time of current chunk in seconds

  const MAX_CHARS = 1000; // maximum number of characters per chunk

  for (const segment of segments) {
    // for first chunk set start time
    if (!currentText) {
      currentStart = segment.startTime;
    }

    // if current chunk is full then push it to chunks
    if (
      currentText.length + segment.text.length > MAX_CHARS
    ) {
      chunks.push({
        content: currentText.trim(),
        startTime: currentStart,
        endTime: currentEnd,
      });

      currentText = "";
      currentStart = segment.startTime;
    }

    currentText += ` ${segment.text}`;
    currentEnd = segment.endTime;
  }

  if (currentText.trim()) {
    chunks.push({
      content: currentText.trim(),
      startTime: currentStart,
      endTime: currentEnd,
    });
  }

  return chunks;
}