import { Router } from "express";

import {
  createYouTubeVideoController,
  getVideoController
} from "@/controllers/video.controller";

const router = Router();

router.route("/youtube").post(createYouTubeVideoController);
router.route("/:id").get(getVideoController);

export default router;