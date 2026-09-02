import { Router } from "express";

import { requireAuth } from "@/middleware/auth.middleware";

import {
  createConversation,
  getVideoConversations,
  getConversation,
  deleteConversation,
  getMessagesOfConversation,
  getConversations
} from "@/controllers/conversation.controller";

const router = Router();

router
  .route("/videos/:videoId/conversations")
  .post(requireAuth, createConversation)
  .get(requireAuth, getVideoConversations);

router
  .route("/conversations/:conversationId")
  .get(requireAuth, getConversation)
  .delete(requireAuth, deleteConversation);

router
  .route("/conversations/:conversationId/messages")
  .get(requireAuth, getMessagesOfConversation)

router
  .route("/conversations")
  .get(requireAuth, getConversations)

export default router;