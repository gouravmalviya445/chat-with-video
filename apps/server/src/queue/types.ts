export interface VideoIngestionJob {
  videoId: string;
  source: "youtube" | "upload";
}
