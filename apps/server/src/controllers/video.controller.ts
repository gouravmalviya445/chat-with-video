import type { Request, Response, NextFunction } from "express";

import { createYouTubeVideo } from "@repository/video.repository";
import { enqueueVideoIngestion } from "@services/queue.service";
import { createYouTubeVideoSchema } from "@validators/video.validator";

import { ApiResponse } from "@/utils/ApiResponse";
import createHttpError from "http-errors";


/**
 * creates a youtube video entry in the database and pushes a job to the queue for fetching and processing the video.
 */
export async function createYouTubeVideoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    // parsed req body
    const parsed = createYouTubeVideoSchema.safeParse(req.body);

    // check if parsed body is valid
    if (!parsed.success) {
      next(createHttpError(400, parsed.error.issues.map((issue) => `${issue.message}`).join("\n")));
      return;
    }

    // Temporary user ID.
    const userId = "2e8a68f0-9037-4981-a217-211364265757";

    // store video metadata in db
    const video = await createYouTubeVideo({
      userId,
      title: parsed.data.title,
      youtubeUrl: parsed.data.youtubeUrl,
    });

    if (!video) {
      next(createHttpError(500, "Failed to create video"));
      return;
    }

    // push job to queue for fetching and processing
    await enqueueVideoIngestion(
      video.id,
      "youtube",
    );

    res
      .status(202)
      .json(new ApiResponse(
        202,
        "Video created successfully",
        {
          id: video.id,
          status: video.status,
        }
      ));
    return;
  } catch (error: any) {
    next(createHttpError(500, "Internal server error", error));
  }
}