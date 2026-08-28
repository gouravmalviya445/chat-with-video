import { Worker } from "bullmq";

import redis from "@/config/redis";
import type { VideoIngestionJob } from "@/queue/types";

import { findVideoById, updateVideoStatus } from "@repository/video.repository";
import { ingestYouTubeVideo } from "@/services/ingestion/ingestion.service";

const worker = new Worker<VideoIngestionJob>(
  "video-ingestion",

  async (job) => {
    const { videoId, source, userId } = job.data;
    console.log("userid: ", userId)

    // find the video if avalable in database
    const video = await findVideoById(videoId, userId);

    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }

    // update video status to processing
    await updateVideoStatus(
      videoId,
      "PROCESSING"
    );

    try {

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

      // update video status to ready
      await updateVideoStatus(
        videoId,
        "READY",
      );
    } catch (error) {
      await updateVideoStatus(
        videoId,
        "FAILED",
      );

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