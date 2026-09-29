import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

const videoStatusEnum = pgEnum("video_status", [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

const videoSourceEnum = pgEnum("video_source", [
  "YOUTUBE",
  "UPLOAD",
]);

const videos = pgTable(
  "videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Foreign Key
    userId: text("user_id")
      .notNull()
      .references((): AnyPgColumn => user.id, {
        onDelete: "cascade"
      }),

    // Video Information
    title: text("title").notNull(),
    description: text("description"),

    // Video source
    source: videoSourceEnum("source")
      .notNull(),

    youtubeUrl: text("youtube_url"),
    storageUrl: text("storage_url"),
    duration: integer("duration"),

    status: videoStatusEnum("status")
      .default("PENDING")
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
  },
  (table) => [
    index("videos_user_created_at_idx").on(
      table.userId,
      table.createdAt
    )
  ]
);

export {
  videoStatusEnum,
  videoSourceEnum,
  videos
}