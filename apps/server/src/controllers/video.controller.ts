import type { Request, Response, NextFunction } from "express";

import { createVideo, createYouTubeVideo, deleteVideoById, findVideoById, getAllVideos } from "@repository/video.repository";
import { enqueueVideoIngestion } from "@services/queue.service";
import { createVideoUploadSchema, createYouTubeVideoSchema, getUserVideosSchema } from "@/validators/video.schema";

import { ApiResponse } from "@/utils/ApiResponse";
import createHttpError from "http-errors";
import { createVideoUploadUrl, getVideoStoragePath } from "@/services/storage.service";


/**
 * creates a youtube video entry in the database and pushes a job to the queue for fetching and processing the video.
 */
async function createYtVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // parsed req body
    const parsed = createYouTubeVideoSchema.safeParse(req.body);

    // check if parsed body is valid
    if (!parsed.success) {
      next(
        createHttpError(
          400,
          parsed.error.issues
            .map((issue) => `${issue.message}`)
            .join("\n")
        )
      );
      return;
    }

    // store video metadata in db
    const video = await createYouTubeVideo({
      userId: req.user.id,
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
      req.user.id,
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
  } catch (error) {
    next(createHttpError(500, "Internal server error"));
  }
}

/**
 * Creates an upload URL for a video file.
 */
async function createVideoUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createVideoUploadSchema.safeParse(req.body);

    if (!parsed.success) {
      next(
        createHttpError(
          400,
          parsed.error.issues
            .map((issue) => `${issue.message}`)
            .join("\n")
        )
      );
      return;
    }

    // Generate ID first because we need it for the storage path.
    const videoId = crypto.randomUUID();

    // get storage path for the video 
    const storagePath = getVideoStoragePath(
      req.user.id,
      videoId
    );

    // store uploaded video metadata in db
    const video = await createVideo({
      id: videoId,
      userId: req.user.id,
      title: parsed.data.title,
      storageUrl: storagePath,
      source: "UPLOAD",
      status: "PENDING",
    })

    if (!video) {
      next(createHttpError(500, "Failed to create video"));
      return;
    }

    // generate pre-signed url for uploading video
    const upload = await createVideoUploadUrl(storagePath);

    res
      .status(201)
      .json(new ApiResponse(
        201,
        "Video upload initialized",
        {
          videoId: videoId,
          path: upload.path,
          token: upload.token
        }
      ))
  } catch (error) {
    next(error);
  }
}

/**
 * checks the video status and returns the video metadata
 */
async function getVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const videoId = req.params?.id as (string | undefined);

    if (!videoId) {
      next(createHttpError(400, "Video ID is required"));
      return;
    }

    const userId = req.user.id;

    // check the status of video
    const video = await findVideoById(videoId, userId);

    if (!video) {
      next(createHttpError(404, "Video not found"));
      return;
    }

    res
      .status(200)
      .json(new ApiResponse(
        200,
        "Video fetched successfully",
        video,
      ));
    return;
  } catch (error) {
    next(createHttpError(500, "Error while fetching video"));
  }
}

/**
 * deletes the video belongs to the authenticated user only
 */
async function deleteVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const videoId = req.params?.id as (string | undefined);

    if (!videoId) {
      next(createHttpError(400, "Video ID is required"))
      return;
    }
    const userId = req.user.id;

    // delete the video belongs to the user
    const deletedVideo = await deleteVideoById(videoId, userId);

    if (!deletedVideo) {
      next(createHttpError(404, "Video not found"))
      return;
    }

    res
      .status(200)
      .json(new ApiResponse(
        200,
        "Video deleted successfully",
        null
      ));
    return;
  } catch (error) {
    next(createHttpError(500, "Failed to delete video"))
  }
}

/**
 * fetches all videos belongs to the authenticated user
 */
async function getUserVideos(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { success, data } = getUserVideosSchema.safeParse(req.query);

    if (!success) {
      next(createHttpError(400, "Invalid pagination parameters"));
      return;
    }
    
    // get all user videos
    const videos = await getAllVideos(
      req.user.id,
      data.limit,
      data.offset
    );
    
    res.status(200).json(
      new ApiResponse(
        200,
        "Videos fetched successfully",
        videos,
      )
    );
  } catch (error) {
    next(createHttpError(500, "Error while fetching videos"))
  }
}

export {
  createYtVideo,
  createVideoUpload,
  getVideo,
  deleteVideo,
  getUserVideos
}