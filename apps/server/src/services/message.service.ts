import createHttpError from "http-errors";

import {
  createMessage,
  getConversationMessages,
} from "@/repositories/message.repository";

import { findConversationById } from "@/repositories/conversation.repository";

/**
 * Creates a user message in the database.
 * 
 * @param conversationId - ID of the conversation
 * @param userId - ID of the user
 * @param content - content of the message
 * @returns created message
 */
export async function createUserMessage({
  conversationId,
  userId,
  content,
}: {
  conversationId: string;
  userId: string;
  content: string;
}) {
  const conversation = await findConversationById(
    conversationId,
    userId,
  );

  if (!conversation) {
    throw createHttpError(404, "Conversation not found");
  }

  return createMessage({
    conversationId,
    role: "USER",
    content,
  });
}

/**
 * Retrieves all messages for a specific conversation owned by user 
 * in order of creation time
 * 
 * @param conversationId - ID of the conversation
 * @param userId - ID of the user
 * @returns array of messages in the conversation
 */
export async function getUserMessages({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const conversation = await findConversationById(
    conversationId,
    userId,
  );

  if (!conversation) {
    throw createHttpError(404, "Conversation not found");
  }

  return getConversationMessages(conversationId);
}