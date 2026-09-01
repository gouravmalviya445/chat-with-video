import { Router } from "express";

import { requireAuth } from "@/middleware/auth.middleware";
import { sendMessage } from "@/controllers/chat.controller";

const router = Router();

router
  .route("/conversations/:conversationId/messages")
  .post(requireAuth, sendMessage);

export default router;