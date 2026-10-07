"use client";

import { useState } from "react";
import {
  FileText,
  Layers,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Upload,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceStats } from "./workspace-stats";
import { DocumentList } from "./document-list";
import { PdfUploadDialog } from "./pdf-upload-dialog";
import { CourseChatView } from "./chat/course-chat-view";
import { useSearchParams } from "next/navigation";
import type { CourseWithStats } from "@/types/course";
import type { DocumentItem } from "@/types/document";
import type { ThreadListItem } from "@/data/chat";

interface WorkspaceViewProps {
  course: CourseWithStats;
  documents: DocumentItem[];
  initialThreads?: ThreadListItem[];
}

export function WorkspaceView({
  course,
  documents,
  initialThreads = [],
}: WorkspaceViewProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Course Header */}
      <WorkspaceHeader course={course} />

      {/* Tabs navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <div className="border-b border-border/40 pb-px overflow-x-auto">
          <TabsList variant="line" className="h-10 p-0 gap-4 sm:gap-6 bg-transparent">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent px-2 pb-2.5 pt-1 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-none border-b-2 border-transparent px-2 pb-2.5 pt-1 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-2"
            >
              <span>Documents</span>
              <Badge
                variant="secondary"
                className="size-5 rounded-full p-0 flex items-center justify-center text-[10px]"
              >
                {documents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="rounded-none border-b-2 border-transparent px-2 pb-2.5 pt-1 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="size-3.5 text-amber-400" />
              <span>AI Tutor</span>
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="rounded-none border-b-2 border-transparent px-2 pb-2.5 pt-1 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="size-3.5 text-purple-400" />
              <span>Flashcards</span>
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="rounded-none border-b-2 border-transparent px-2 pb-2.5 pt-1 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="size-3.5 text-emerald-400" />
              <span>Quizzes</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
          {/* Workspace Stats Row */}
          <WorkspaceStats course={course} />

          {/* Quick Study Modes Action Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Study Acceleration
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Tile 1: AI Tutor */}
              <div
                onClick={() => setActiveTab("chat")}
                className="group cursor-pointer rounded-2xl border border-border/70 bg-card/50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-card shadow-xs"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3 transition-transform group-hover:scale-105">
                  <BrainCircuit className="size-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground flex items-center justify-between">
                  <span>Chat with AI Tutor</span>
                  <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Ask questions about your lectures, solve problem sets, and get step-by-step explanations.
                </p>
              </div>

              {/* Tile 2: Flashcards */}
              <div
                onClick={() => setActiveTab("flashcards")}
                className="group cursor-pointer rounded-2xl border border-border/70 bg-card/50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/40 hover:bg-card shadow-xs"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 mb-3 transition-transform group-hover:scale-105">
                  <Layers className="size-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground flex items-center justify-between">
                  <span>Review Flashcards</span>
                  <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-purple-400" />
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Master key terminology and definitions using spaced-repetition active recall decks.
                </p>
              </div>

              {/* Tile 3: Quizzes */}
              <div
                onClick={() => setActiveTab("quizzes")}
                className="group cursor-pointer rounded-2xl border border-border/70 bg-card/50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-card shadow-xs"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3 transition-transform group-hover:scale-105">
                  <GraduationCap className="size-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground flex items-center justify-between">
                  <span>Practice Quizzes</span>
                  <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Simulate timed midterm and final exam questions generated from your uploaded materials.
                </p>
              </div>
            </div>
          </div>

          {/* Course Documents Section in Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Course Materials & PDFs
                </h3>
                <p className="text-xs text-muted-foreground">
                  Reference documents uploaded to this workspace.
                </p>
              </div>

              {documents.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("documents")}
                  className="gap-1 text-xs text-primary hover:text-primary/90"
                >
                  <span>View all ({documents.length})</span>
                  <ArrowRight className="size-3" />
                </Button>
              )}
            </div>

            <DocumentList
              documents={documents.slice(0, 3)}
              courseId={course.id}
              courseSlug={course.slug}
              courseTitle={course.title}
            />
          </div>
        </TabsContent>

        {/* TAB 2: DOCUMENTS */}
        <TabsContent value="documents" className="space-y-6 mt-0 focus-visible:outline-none">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              All Course Documents
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage all lecture notes, syllabus files, and PDF materials used for AI study generation.
            </p>
          </div>

          <DocumentList
            documents={documents}
            courseId={course.id}
            courseSlug={course.slug}
            courseTitle={course.title}
          />
        </TabsContent>

        {/* TAB 3: AI TUTOR */}
        <TabsContent value="chat" className="mt-0 focus-visible:outline-none">
          <CourseChatView
            course={course}
            documents={documents}
            initialThreads={initialThreads}
          />
        </TabsContent>

        {/* TAB 4: FLASHCARDS */}
        <TabsContent value="flashcards" className="space-y-6 mt-0 focus-visible:outline-none">
          <div className="rounded-2xl border border-border/70 bg-card/40 p-6 sm:p-8 text-center space-y-4">
            <div className="flex size-14 mx-auto items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 ring-8 ring-purple-500/5">
              <Layers className="size-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Active Recall Flashcards
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate flashcard decks automatically from key definitions, formulas, and concepts found in your uploaded materials.
              </p>
            </div>

            {documents.length === 0 ? (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Upload course slides to generate your first flashcard deck.
                </p>
                <PdfUploadDialog
                  courseId={course.id}
                  courseSlug={course.slug}
                  courseTitle={course.title}
                />
              </div>
            ) : (
              <div className="pt-2">
                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs">
                  {course.stats.deckCount} Active Decks
                </Badge>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 5: QUIZZES */}
        <TabsContent value="quizzes" className="space-y-6 mt-0 focus-visible:outline-none">
          <div className="rounded-2xl border border-border/70 bg-card/40 p-6 sm:p-8 text-center space-y-4">
            <div className="flex size-14 mx-auto items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
              <HelpCircle className="size-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Practice Exams & Quizzes
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Test your mastery under exam conditions with multiple-choice, true/false, and short-answer questions.
              </p>
            </div>

            {documents.length === 0 ? (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Upload course materials first to generate diagnostic practice quizzes.
                </p>
                <PdfUploadDialog
                  courseId={course.id}
                  courseSlug={course.slug}
                  courseTitle={course.title}
                />
              </div>
            ) : (
              <div className="pt-2">
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
                  {course.stats.quizCount} Quizzes Available
                </Badge>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
