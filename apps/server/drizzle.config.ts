import { env } from "./src/config/env";
import { defineConfig } from 'drizzle-kit';

const connectionString = env?.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  out: './drizzle/migrations',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString
  },
  strict: true,
  verbose: true
});
