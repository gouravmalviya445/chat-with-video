import { Router } from "express";

import {
  completeVideoUpload,
  createVideoUpload,
  createYtVideo,
  deleteVideo,
  getUserVideos,
  getVideo
} from "@/controllers/video.controller";

import { requireAuth } from "@/middleware/auth.middleware";
import {
  authenticatedRateLimit,
  videoIngestionRateLimit,
} from "@/middleware/rateLimit.middleware";

const router = Router();

router
  .route("/youtube")
  .post(requireAuth, authenticatedRateLimit, videoIngestionRateLimit, createYtVideo);

router
  .route("/upload")
  .post(requireAuth, authenticatedRateLimit, videoIngestionRateLimit, createVideoUpload);

router
  .route("/:id/upload-complete")
  .post(requireAuth, authenticatedRateLimit, videoIngestionRateLimit, completeVideoUpload);

router
  .route("/:id")
  .get(requireAuth, authenticatedRateLimit, getVideo)
  .delete(requireAuth, authenticatedRateLimit, deleteVideo);

router
  .route("/")
  .get(requireAuth, authenticatedRateLimit, getUserVideos);

export default router;
