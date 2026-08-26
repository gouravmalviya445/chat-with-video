import { env } from "@/config/env";
import IORedis from "ioredis";

const redis = new IORedis({
  host: env?.REDIS_HOST,
  port: Number(env?.REDIS_PORT),
  maxRetriesPerRequest: null,  
});

export default redis;