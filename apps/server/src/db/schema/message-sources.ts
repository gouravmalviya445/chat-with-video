import {
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { messages } from "./messages";
import { videoChunks } from "./chunks";

export const messageSources = pgTable("message_sources", {
  id: uuid("id").defaultRandom().primaryKey(),

  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, {
      onDelete: "cascade",
    }),

  videoChunkId: uuid("video_chunk_id")
    .notNull()
    .references(() => videoChunks.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});