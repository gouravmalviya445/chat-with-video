import { z } from "zod";

export const createYouTubeVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(200),

  youtubeUrl: z
    .url({ message: "Please provide a valid youtube url", })
});