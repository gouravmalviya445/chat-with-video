import type {
  Request,
  NextFunction,
  Response,
} from "express";
import createHttpError from "http-errors";

import {
  createUserConversation,
  getUserConversation,
  getUserVideoConversations,
  deleteUserConversation,
} from "@services/conversation.service";

import { ApiResponse } from "@utils/ApiResponse";

/**
 * create a conversation for the user and store it in the database
 */
async function createConversation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const videoId = req.params?.videoId as (string | undefined);
    const title = req.body?.title as (string | undefined);

    if (!videoId) {
      next(createHttpError(400, "Video ID is required"));
      return;
    }

    if (!title) {
      next(createHttpError(400, "Title is required"));
      return;
    }

    const conversation = await createUserConversation({
      userId: req.user.id,
      videoId,
      title,
    });

    if (!conversation) {
      next(createHttpError(500, "Failed to create conversation"));
      return;
    }

    res.status(201).json(
      new ApiResponse(
        201,
        "Conversation created successfully",
        conversation,
      ),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * fetches all conversations of a specific video belongs to the user
 */
async function getVideoConversations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const videoId = req.params?.videoId as (string | undefined);

    if (!videoId) {
      next(createHttpError(400, "Video ID is required"));
      return;
    }

    const conversations = await getUserVideoConversations({
      videoId,
      userId: req.user.id,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        "Conversations fetched successfully",
        conversations,
      ),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * fetches a single conversation of the user
 */
async function getConversation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const conversationId = req.params?.conversationId as (string | undefined);

    if (!conversationId) {
      next(createHttpError(400, "Conversation ID is required"));
      return;
    }

    const conversation = await getUserConversation({
      conversationId,
      userId: req.user.id,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        "Conversation fetched successfully",
        conversation,
      ),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * deletes the conversation belongs to the user
 */
async function deleteConversation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const conversationId = req.params?.conversationId as (string | undefined);

    if (!conversationId) {
      next(createHttpError(400, "Conversation ID is required"));
      return;
    }

    // delte conversation
    await deleteUserConversation({
      conversationId,
      userId: req.user.id,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        "Conversation deleted successfully",
        null,
      ),
    );
  } catch (error) {
    next(error);
  }
}

export {
  createConversation,
  getVideoConversations,
  getConversation,
  deleteConversation,
};