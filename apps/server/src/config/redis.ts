import { env } from "@/config/env";
import IORedis from "ioredis";

const redis = new IORedis({
  host: env?.REDIS_HOST,
  port: Number(env?.REDIS_PORT),
  username: env?.REDIS_USERNAME,
  password: env?.REDIS_PASSWORD,
  tls: Boolean(env?.REDIS_TLS) === true ? {} : undefined,
  maxRetriesPerRequest: null,  
});

export default redis;