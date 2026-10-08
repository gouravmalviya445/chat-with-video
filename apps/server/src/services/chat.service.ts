import createHttpError from "http-errors";

import { findConversationById } from "@repository/conversation.repository";

import { createMessage, createAssistantMessageWithSources } from "@repository/message.repository";

import { retrieveRelevantChunks } from "@services/retrieval.service";

import { streamRagAnswer } from "@ai/llm/generate";
import { RETRIVAL_TOP_K } from "@/constants";

/**
 * Sends a message to the AI assistant with the given conversation and content.
 * 
 * @param userId - ID of the user
 * @param conversationId - ID of the conversation
 * @param content - Content of the message
 * @returns 
 */
export async function chatWithVideo({
  userId,
  conversationId,
  content,
}: {
  userId: string;
  conversationId: string;
  content: string;
}): Promise<{
    userMessage: {
        conversationId: string;
        content: string;
        id: string;
        createdAt: Date;
        role: "USER" | "ASSISTANT";
    } | undefined;
    result: ReturnType<typeof streamRagAnswer>
    sources: {
        id: string;
        content: string;
        startTime: number;
        endTime: number;
    }[];
}> {
  // 1. Verify conversation ownership
  const conversation = await findConversationById(
    conversationId,
    userId,
  );

  if (!conversation) {
    throw createHttpError(404, "Conversation not found");
  }

  // 2. Save user message
  const userMessage = await createMessage({
    conversationId,
    role: "USER",
    content,
  });

  // 3. Retrieve relevant chunks
  const chunks = await retrieveRelevantChunks({
    videoId: conversation.videoId,
    question: content,
    limit: RETRIVAL_TOP_K,
  });

  // 4. Build RAG context
  const context = chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}] (${chunk.startTime} - ${chunk.endTime}):\n${chunk.content}\n`,
    )
    .join("\n\n");

  // generate sources metadata from the chunks
  const sources = chunks.map((chunk) => ({
    id: chunk.id,
    content: chunk.content,
    startTime: chunk.startTime,
    endTime: chunk.endTime,
  }));

  const videoChunkIds = [
    ... new Set(chunks.map(chunk => chunk.id))
  ]
  
  // 5. Start LLM stream
  const result = streamRagAnswer({
    question: content,
    context,

    // Persist assistant response after generation finishes
    onEnd: async (text: string) => {
      // create assistant messagee + message sources in a single transaction
      await createAssistantMessageWithSources({
        conversationId,
        content: text, // text is the final response of llm after streaming
        videoChunkIds
      })
    },
  });

  return {
    userMessage,
    result,
    sources,
  };
}