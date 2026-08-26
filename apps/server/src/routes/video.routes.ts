import { Router } from "express";

import {
  createYouTubeVideoController,
} from "@/controllers/video.controller";

const router = Router();

router.route("/youtube").post(createYouTubeVideoController);

export default router;