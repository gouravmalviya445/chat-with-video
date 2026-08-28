export interface VideoIngestionJob {
  videoId: string;
  userId: string;
  source: "youtube" | "upload";
}
