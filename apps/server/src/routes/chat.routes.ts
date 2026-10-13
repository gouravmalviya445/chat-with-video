import { Router } from "express";

import { requireAuth } from "@/middleware/auth.middleware";
import { authenticatedRateLimit, chatRateLimit } from "@/middleware/rateLimit.middleware";
import { sendMessage } from "@/controllers/chat.controller";

const router = Router();

router
  .route("/conversations/:conversationId/messages")
  .post(requireAuth, authenticatedRateLimit, chatRateLimit, sendMessage);

export default router;
