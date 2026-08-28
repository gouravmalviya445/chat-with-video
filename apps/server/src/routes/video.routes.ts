import { Router } from "express";

import {
  createYtVideo,
  deleteVideo,
  getVideo
} from "@/controllers/video.controller";

import { requireAuth } from "@/middleware/auth.middleware";

const router = Router();

router.route("/youtube").post(requireAuth, createYtVideo);
router.route("/:id").get(requireAuth, getVideo);
router.route("/:id").delete(requireAuth, deleteVideo)

export default router;