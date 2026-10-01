import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./courses";
import { documents } from "./documents";

export interface QuizCitation {
  documentTitle: string;
  pageNumber: number;
  excerpt: string;
  isDetached?: boolean;
}

export const quizzes = pgTable(
  "quizzes",
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("quizzes_course_idx").on(table.courseId)]
);

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    options: jsonb("options").$type<string[]>().notNull(), // Exactly 4 options for v1
    correctOptionIndex: integer("correct_option_index").notNull(),
    explanation: text("explanation").notNull(),
    citation: jsonb("citation").$type<QuizCitation>(),
  },
  (table) => [index("quiz_questions_quiz_idx").on(table.quizId)]
);

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scorePercent: integer("score_percent").notNull(),
    userAnswers: jsonb("user_answers").$type<Record<string, number>>().notNull(), // questionId -> selectedIndex
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [
    index("quiz_attempts_quiz_idx").on(table.quizId),
    index("quiz_attempts_user_idx").on(table.userId),
  ]
);
