import dotenv from "dotenv";
import path from "node:path";
import z from "zod";

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
})

const envSchema = z.object({
  PORT: z.string().optional().default("8001"),

  // postgres db url
  DATABASE_URL: z.url({ message: "DATABASE_URL is required" }),
})

const {data: env, success, error} = envSchema.safeParse(process.env);

if (!success || env === undefined) {
  console.error("Invalid environment variables:", error.issues);
  process.exit(1);
} else {
  console.log("Environment variable loaded from env file")
}

export { env };