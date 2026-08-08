import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@config/env";

const connectionString = env?.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000, // idle time out for clients after no use
});

const db = drizzle({ client: pool });

export default db;