import { z } from "zod";

export const youtubeVideoSchema = z.object({
  title: z
    .string()
    .default(""),
  youtubeUrl: z
    .string()
    .min(1, "YouTube URL is required")
    .refine(
      (url) =>
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/.test(
          url
        ),
      "Please enter a valid YouTube video URL"
    ),
});

export type YouTubeVideoFormData = z.infer<typeof youtubeVideoSchema>;

export const uploadVideoSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters"),
});

export type UploadVideoFormData = z.infer<typeof uploadVideoSchema>;
