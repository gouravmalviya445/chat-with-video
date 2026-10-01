import { CHAT_MODEL, TRANSCRIPTION_MODEL } from "@/constants";
import { google } from "@ai-sdk/google";

export const chatModel = google.chat(CHAT_MODEL);
export const transcriptionModel = google.transcription(TRANSCRIPTION_MODEL);