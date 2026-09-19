import { transcribe } from "ai";
import type { DataContent } from "ai";

import { transcriptionModel } from "./model";

/**
 * Transcribe the audio with the transcription model
 * @param audio - audio to be transcribe
 * @returns - promise of transcription result
 */
export function generateTranscription(
  audio: DataContent
) {
  return transcribe({
    model: transcriptionModel,
    audio: audio,
    providerOptions: {
      google: {
        wordTimestamp: true
      },
    },
  });
}