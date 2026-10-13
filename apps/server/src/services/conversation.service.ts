import createHttpError from "http-errors";

import {
  createConversation,
  findConversationById,
  getConversationsByVideoId,
  deleteConversation,
  getUserConversations
} from "@/repositories/conversation.repository";

import { findVideoById } from "@/repositories/video.repository";

import { findMessagesByConversationId } from "@repository/message.repository";

import { findMessageSources } from "@repository/message-source.repository";
import { cacheKeys, getOrSetCache } from "@/utils/cache";


/**
 * creates a new conversation for a video belongs to user
 * @param userId - ID of the user
 * @param videoId - ID of the video
 * @param title - title of the conversation
 * @returns conversation
 */
export async function createUserConversation({
  userId,
  videoId,
  title,
}: {
  userId: string;
  videoId: string;
  title?: string;
}) {
  // Verify that the authenticated user owns the video.
  const video = await findVideoById(videoId, userId);

  if (!video) {
    throw createHttpError(404, "Video not found");
  }

  // don't start conversations against a video
  // that doesn't have usable indexed content.
  if (video.status !== "READY") {
    throw createHttpError(
      409,
      "Video is not ready for conversation",
    );
  }

  return createConversation({
    userId,
    videoId,
    title,
  });
}

/**
 * gets a conversation of the user
 * @param conversationId - ID of the conversation
 * @param userId - ID of the user
 * @returns conversation
 */
export async function getUserConversation({
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

  return conversation;
}

/**
 * gets all conversations of the user that belongs to the video
 * @param videoId - ID of the video
 * @param userId - ID of the user
 * @returns array of conversations that belong to the video
 */
export async function getUserVideoConversations({
  videoId,
  userId,
}: {
  videoId: string;
  userId: string;
}) {
  // First verify video ownership.
  const video = await findVideoById(videoId, userId);

  if (!video) {
    throw createHttpError(404, "Video not found");
  }

  return getConversationsByVideoId(
    videoId,
    userId,
  );
}

/**
 * deletes the conversation that belongs to user
 * @param conversationId - ID of the conversation
 * @param userId - ID of the user
 * @returns deleted conversation
 */
export async function deleteUserConversation({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const conversation = await deleteConversation(
    conversationId,
    userId,
  );

  if (!conversation) {
    throw createHttpError(404, "Conversation not found");
  }

  return conversation;
}

/**
 * gets conversation messages along with the sources for the assistant messages
 * @param userId - ID of the user
 * @param conversationId - ID of the conversation
 * @returns array of messages in the conversation
 */
export async function getConversationMessages({
  userId,
  conversationId,
}: {
  userId: string;
  conversationId: string;
}) {
  const conversation = await findConversationById(
    conversationId,
    userId,
  );

  if (!conversation) {
    throw createHttpError(
      404,
      "Conversation not found",
    );
  }

  return getOrSetCache(
    cacheKeys.conversationMessages(userId, conversationId),
    async () => {
      const messages = await findMessagesByConversationId(conversationId);
      return Promise.all(
        messages.map(async (message) => {
          if (message.role === "USER") return { ...message, sources: [] };
          const sources = await findMessageSources(message.id);
          return { ...message, sources };
        }),
      );
    },
  );
}

/**
 * gets list of conversations for the user
 * @param userId - ID of the user
 * @param limit - limit of the number of conversations to return
 * @param offset - offset of the number of conversations to return
 * @returns array of conversations that belong to the user
 */
export async function getUserConversationList({
  userId,
  limit = 10,
  offset = 0,
}: {
  userId: string;
  limit?: number;
  offset?: number;
}) {
  return getUserConversations(
    userId,
    limit,
    offset,
  );
}
