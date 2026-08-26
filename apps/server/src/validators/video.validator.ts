import { z } from "zod";

export const createYouTubeVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Video title must be at least 3 characters long.")
    .max(200, "Video title cannot exceed 200 characters."),

  youtubeUrl: z
    .string()
    .regex(
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)(?:&.*)?$/
      , "Invalid YouTube video URL"
    )
});