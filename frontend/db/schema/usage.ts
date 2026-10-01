import { pgTable, text, timestamp, integer, uuid, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const usageCounters = pgTable(
  "usage_counters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    counterType: text("counter_type").notNull(), // "chat_10min" | "flashcard_day" | "quiz_day"
    count: integer("count").default(0).notNull(),
    windowResetAt: timestamp("window_reset_at").notNull(),
  },
  (table) => [
    index("usage_counters_user_type_idx").on(table.userId, table.counterType),
  ]
);
