import { YoutubeTranscript } from "youtube-transcript";

import type { TranscriptSegment } from "./types";
import { extractYouTubeVideoId } from "@/utils/youtube";

/**
 * Fetches the transcript of a YouTube video using the youtube-transcript library.
 * @param url The URL of the YouTube video.
 * @returns A Promise that resolves to an array of TranscriptSegment objects.
 */
export async function getYouTubeTranscript(
  url: string,
): Promise<TranscriptSegment[]> {
  // extract video id
  const videoId = extractYouTubeVideoId(url);

  // fetch transcript of video
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);

  // return transcript with required format for chunking
  return transcript.map((segment) => ({
    text: segment.text,
    startTime: segment.offset / 1000,
    endTime: (segment.offset + segment.duration) / 1000,
  }));
}