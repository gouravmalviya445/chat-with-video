import createHttpError from "http-errors";

import {
  createConversation,
  findConversationById,
  getConversationsByVideoId,
  deleteConversation,
} from "@/repositories/conversation.repository";

import { findVideoById } from "@/repositories/video.repository";

/**
 * creates a new conversation for a video belongs to user
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

  return createConversation({
    userId,
    videoId,
    title,
  });
}


/**
 * gets a conversation of the user
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