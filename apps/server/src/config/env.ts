import dotenv from "dotenv";
import path from "node:path";
import z from "zod";

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
})

const envSchema = z.object({
  PORT: z.string().optional().default("8001"),
  NODE_ENV: z.enum(["production", "development"]),
  DATABASE_URL: z.url({ message: "DATABASE_URL is required" }),
  REDIS_HOST: z.string({ message: "REDIS_HOST is required" }),
  REDIS_PORT: z.string().default("6379"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  SUPABASE_URL: z.url({ message: "SUPABASE_URL is required" }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1),
})

const {data: env, success, error} = envSchema.safeParse(process.env);

if (!success || env === undefined) {
  console.error("Invalid environment variables:\n", error.issues.map((issue, idx) => `${idx + 1}. ${ issue.message }`).join("\n"));
  process.exit(1);
} else {
  console.log("Environment variable loaded from env file")
}

export { env };