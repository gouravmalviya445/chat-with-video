import { Router } from "express";

import { requireAuth } from "@/middleware/auth.middleware";

import {
  createConversation,
  getVideoConversations,
  getConversation,
  deleteConversation,
} from "@/controllers/conversation.controller";

const router = Router();

router
  .route("/videos/:videoId/conversations")
  .post(requireAuth, createConversation);

router
  .route("/videos/:videoId/conversations")
  .get(requireAuth, getVideoConversations);

router
  .route("/conversations/:conversationId")
  .get(requireAuth, getConversation);

router
  .route("/conversations/:conversationId")
  .delete(requireAuth, deleteConversation,);

export default router;