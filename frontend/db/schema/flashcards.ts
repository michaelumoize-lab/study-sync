import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./courses";
import { documents } from "./documents";

export const flashcardRatingEnum = pgEnum("flashcard_rating", [
  "NEW",
  "HARD",
  "MEDIUM",
  "EASY",
]);

export interface FlashcardCitation {
  documentTitle: string;
  pageNumber: number;
  excerpt: string;
  isDetached?: boolean;
}

export const flashcardDecks = pgTable(
  "flashcard_decks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceDocumentId: uuid("source_document_id").references(
      () => documents.id,
      { onDelete: "set null" }
    ),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("flashcard_decks_course_idx").on(table.courseId)]
);

export const flashcards = pgTable(
  "flashcards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deckId: uuid("deck_id")
      .notNull()
      .references(() => flashcardDecks.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    citation: jsonb("citation").$type<FlashcardCitation>(),
    rating: flashcardRatingEnum("rating").default("NEW").notNull(),
    lastReviewedAt: timestamp("last_reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("flashcards_deck_idx").on(table.deckId)]
);
