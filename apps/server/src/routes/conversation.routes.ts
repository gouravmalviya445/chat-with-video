import { Router } from "express";

import { requireAuth } from "@/middleware/auth.middleware";
import { authenticatedRateLimit } from "@/middleware/rateLimit.middleware";

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
  .post(requireAuth, authenticatedRateLimit, createConversation)
  .get(requireAuth, authenticatedRateLimit, getVideoConversations);

router
  .route("/conversations/:conversationId")
  .get(requireAuth, authenticatedRateLimit, getConversation)
  .delete(requireAuth, authenticatedRateLimit, deleteConversation);

router
  .route("/conversations/:conversationId/messages")
  .get(requireAuth, authenticatedRateLimit, getMessagesOfConversation)

router
  .route("/conversations")
  .get(requireAuth, authenticatedRateLimit, getConversations)

export default router;
