import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./courses";
import { vector768 } from "./custom-types";

export const documentStatusEnum = pgEnum("document_status", [
  "UPLOADING",
  "UPLOADED",
  "PROCESSING",
  "STALE_RETRYABLE",
  "READY",
  "FAILED",
]);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    r2Key: text("r2_key").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    pageCount: integer("page_count").default(0).notNull(),
    status: documentStatusEnum("status").default("UPLOADING").notNull(),
    errorMessage: text("error_message"),
    processingStartedAt: timestamp("processing_started_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("documents_course_status_idx").on(table.courseId, table.status),
    index("documents_user_idx").on(table.userId),
  ]
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    pageStart: integer("page_start").notNull(),
    pageEnd: integer("page_end").notNull(),
    charStart: integer("char_start"),
    charEnd: integer("char_end"),
    embedding: vector768("embedding").notNull(),
    embeddingModel: text("embedding_model")
      .default("gemini-embedding-2")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("chunks_course_doc_idx").on(table.courseId, table.documentId),
    index("chunks_doc_idx").on(table.documentId),
  ]
);
