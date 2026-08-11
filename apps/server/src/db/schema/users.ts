import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

const users = pgTable("users", {
  // PRIMARY_KEY
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"),

  createdAt: timestamp("created_at", {
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  })
    .defaultNow()
    .notNull()
})

export { users }