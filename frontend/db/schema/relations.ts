import { relations } from "drizzle-orm";
import { users, sessions, accounts } from "./users";
import { courses } from "./courses";
import { documents, documentChunks } from "./documents";
import { chatThreads, chatMessages } from "./chat";
import { flashcardDecks, flashcards } from "./flashcards";
import { quizzes, quizQuestions, quizAttempts } from "./quizzes";

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  sessions: many(sessions),
  accounts: many(accounts),
  documents: many(documents),
  chatThreads: many(chatThreads),
  flashcardDecks: many(flashcardDecks),
  quizzes: many(quizzes),
  quizAttempts: many(quizAttempts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user: one(users, { fields: [courses.userId], references: [users.id] }),
  documents: many(documents),
  chatThreads: many(chatThreads),
  flashcardDecks: many(flashcardDecks),
  quizzes: many(quizzes),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  course: one(courses, { fields: [documents.courseId], references: [courses.id] }),
  user: one(users, { fields: [documents.userId], references: [users.id] }),
  chunks: many(documentChunks),
  flashcardDecks: many(flashcardDecks),
  quizzes: many(quizzes),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
  course: one(courses, {
    fields: [documentChunks.courseId],
    references: [courses.id],
  }),
}));

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  course: one(courses, { fields: [chatThreads.courseId], references: [courses.id] }),
  user: one(users, { fields: [chatThreads.userId], references: [users.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id],
  }),
}));

export const flashcardDecksRelations = relations(flashcardDecks, ({ one, many }) => ({
  course: one(courses, { fields: [flashcardDecks.courseId], references: [courses.id] }),
  user: one(users, { fields: [flashcardDecks.userId], references: [users.id] }),
  sourceDocument: one(documents, {
    fields: [flashcardDecks.sourceDocumentId],
    references: [documents.id],
  }),
  cards: many(flashcards),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  deck: one(flashcardDecks, {
    fields: [flashcards.deckId],
    references: [flashcardDecks.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, { fields: [quizzes.courseId], references: [courses.id] }),
  user: one(users, { fields: [quizzes.userId], references: [users.id] }),
  sourceDocument: one(documents, {
    fields: [quizzes.sourceDocumentId],
    references: [documents.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
}));
