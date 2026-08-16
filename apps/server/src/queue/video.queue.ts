import { Queue } from "bullmq";
import redis from "@config/redis";

const videoIngestionQueue = new Queue("video-ingestion", {
  connection: redis
});

export { videoIngestionQueue };