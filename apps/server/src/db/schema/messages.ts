import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { conversations } from "./conversations";

const messageRoleEnum = pgEnum("message_role", [
  "USER",
  "ASSISTANT",
]);

const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Foreign key to the conversation that this message belongs to
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, {
      onDelete: "cascade",
    }),

  role: messageRoleEnum("role").notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export {
  messages,
  messageRoleEnum
}