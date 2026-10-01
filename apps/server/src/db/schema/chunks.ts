import {
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  vector
} from "drizzle-orm/pg-core";

import { videos } from "./videos";

const videoChunks = pgTable("video_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),

  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, {
      onDelete: "cascade",
    }),

  // The index in which the chunk appears in the video (0, 1, 2, ...)
  chunkIndex: integer("chunk_index").notNull(),

  // The actual content of the chunk
  content: text("content").notNull(),

  // The start time of the chunk means which second of the video does the chunk start at.
  startTime: real("start_time").notNull(),

  // The end time of the chunk means which second of the video does the chunk end at.
  endTime: real("end_time").notNull(),

  tokenCount: integer("token_count"),

  embedding: vector("embedding", {
    dimensions: 768,
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export { videoChunks };