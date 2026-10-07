CREATE TYPE "public"."chat_message_status" AS ENUM('complete', 'stopped', 'error');--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "status" "chat_message_status" DEFAULT 'complete' NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "model" text;--> statement-breakpoint
CREATE UNIQUE INDEX "courses_user_slug_idx" ON "courses" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "chat_threads_user_updated_idx" ON "chat_threads" USING btree ("user_id","updated_at");