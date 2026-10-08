import { z } from "zod";

export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content cannot be empty"),
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
