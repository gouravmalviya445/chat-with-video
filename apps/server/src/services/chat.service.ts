import createHttpError from "http-errors";

import { findConversationById } from "@repository/conversation.repository";
import { createMessageSources } from "@repository/message-source.repository";

import { createMessage } from "@repository/message.repository";

import { retrieveRelevantChunks } from "@services/retrieval.service";

import { streamRagAnswer } from "@ai/llm/generate";

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
}) {
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
    limit: 5,
  });

  // 4. Build RAG context
  const context = chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}]\n${chunk.content}`,
    )
    .join("\n\n");

  // generate sources metadata from the chunks
  const sources = chunks.map((chunk) => ({
    id: chunk.id,
    content: chunk.content,
    startTime: chunk.startTime,
    endTime: chunk.endTime,
  }));

  // 5. Start LLM stream
  const result = streamRagAnswer({
    question: content,
    context,

    // Persist assistant response after generation finishes
    onEnd: async (text: string) => {
      const assistantMessage = await createMessage({
        conversationId,
        role: "ASSISTANT",
        content: text,
      });

      if (!assistantMessage) {
        throw createHttpError(500, "Failed to create assistant message");
      }

      // create message sources for assistant response
      await createMessageSources(
        assistantMessage.id,
        chunks.map((chunk) => chunk.id),
      );
    },
  });

  return {
    userMessage,
    result,
    sources,
  };
}