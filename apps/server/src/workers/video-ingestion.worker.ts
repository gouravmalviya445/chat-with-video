import { Worker } from "bullmq";

import redis from "@/config/redis";
import type { VideoIngestionJob } from "@/queue/types";

import { findVideoById, updateVideoStatus } from "@repository/video.repository";
import { ingestUploadedVideo, ingestYouTubeVideo } from "@/services/ingestion/ingestion.service";

const worker = new Worker<VideoIngestionJob>(
  "video-ingestion",

  async (job) => {
    const { videoId, source, userId } = job.data;

    // find the video if avalable in database
    const video = await findVideoById(videoId, userId);

    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }
    
    try {
      // update video status to processing
      await updateVideoStatus(
        videoId,
        "PROCESSING"
      );

      if (source === "youtube") {
        if (!video.youtubeUrl) {
          throw new Error(
            "YouTube URL is missing",
          );
        }

        // handle youtube video ingestion
        await ingestYouTubeVideo(
          video.id,
          video.youtubeUrl,
        );
      }

      if (source === "upload") {
        if (!video.storageUrl) {
          throw new Error("Uploaded video storage path is missing");
        }

        // handle upload video ingestion
        await ingestUploadedVideo(
          video.id,
          video.storageUrl
        );
      }

      // update video status to ready
      await updateVideoStatus(
        videoId,
        "READY",
      );
    } catch (error) {
      const isFinalAttempt =
        job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      
      if (isFinalAttempt) {
        await updateVideoStatus(
          videoId,
          "FAILED",
        );
      }

      throw error;
    }
  },

  {
    connection: redis,
    concurrency: 2,
  },
);

worker.on("completed", (job) => {
  console.log(
    `Video ingestion job ${job.id} completed`,
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `Video ingestion job ${job?.id} failed`,
    error,
  );
});