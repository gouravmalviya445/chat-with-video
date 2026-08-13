import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

const videoStatusEnum = pgEnum("video_status", [
  "UPLOADING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Foreign Key
  userId: uuid("user_id")
    .notNull()
    .references((): AnyPgColumn => users.id, {
      onDelete: "cascade"
    }),

  // Video Information
  title: text("title").notNull(),
  description: text("description"),
  youtubeUrl: text("youtube_url"),
  storageUrl: text("storage_url"),
  duration: integer("duration"),

  status: videoStatusEnum("status")
    .default("UPLOADING")
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export {
  videoStatusEnum,
  videos
}