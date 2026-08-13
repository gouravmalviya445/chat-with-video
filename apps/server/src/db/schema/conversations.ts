import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { videos } from "./videos";

const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Foreign key to the user who owns this conversation
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  // Foreign key to the video that this conversation is about
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, {
      onDelete: "cascade",
    }),

  // The title of the conversation
  title: text("title"),

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

export { conversations };