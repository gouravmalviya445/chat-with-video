import { streamText } from "ai";

import { chatModel } from "./model";
import { buildRagPrompt } from "./prompts";

/**
 * stream llm response to client
 * 
 * @param question - The question user ask
 * @param context - The context of the video
 * @param onEnd callback function
 * @returns StreamTextResult
 */
export function streamRagAnswer({
  question,
  context,
  onEnd
}: {
  question: string;
  context: string;
  onEnd: (text: string) => Promise<void>;
}): ReturnType<typeof streamText> {
  return streamText({
    model: chatModel,
    prompt: buildRagPrompt({
      question,
      context,
    }),
    onEnd: async ({ text }) => {
      await onEnd(text);
    }
  });
}