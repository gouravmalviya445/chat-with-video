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

const router = Router();

router
  .route("/youtube")
  .post(requireAuth, createYtVideo);

router
  .route("/upload")
  .post(requireAuth, createVideoUpload);

router
  .route("/:id/upload-complete")
  .post(requireAuth, completeVideoUpload);

router
  .route("/:id")
  .get(requireAuth, getVideo)
  .delete(requireAuth, deleteVideo);

router
  .route("/")
  .get(requireAuth, getUserVideos);

export default router;