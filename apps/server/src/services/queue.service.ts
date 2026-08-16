import { videoIngestionQueue } from "@queue/video.queue";

export async function enqueueVideoIngestion(
  videoId: string,
  source: "youtube" | "upload",
) {
  return videoIngestionQueue.add(
    "process-video",
    {
      videoId,
      source,
    },
    {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 5000,
      },

      removeOnComplete: {
        count: 100,
      },

      removeOnFail: {
        count: 500,
      },
    },
  );
}