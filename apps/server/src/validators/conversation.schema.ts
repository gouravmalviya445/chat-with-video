import { z } from "zod";

export const createConversationSchema = z.object({
  videoId: z.string().uuid("Invalid video ID"),

  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title is too long")
    .optional(),
});