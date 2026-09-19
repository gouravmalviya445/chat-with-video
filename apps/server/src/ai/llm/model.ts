import { google } from "@ai-sdk/google";

export const chatModel = google.chat("gemini-3.5-flash-lite");
export const transcriptionModel = google.transcription("gemini-3.5-transcribe");