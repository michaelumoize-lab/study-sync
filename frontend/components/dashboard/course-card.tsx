"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  FileText,
  Layers,
  HelpCircle,
  Clock,
  ArrowRight,
  Pencil,
  Trash2,
  FolderOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditCourseDialog } from "./edit-course-dialog";
import { DeleteCourseDialog } from "./delete-course-dialog";
import type { CourseWithStats } from "@/types/course";
import { formatDistanceToNow } from "date-fns";

interface CourseCardProps {
  course: CourseWithStats;
}

export function CourseCard({ course }: CourseCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(course.updatedAt), {
    addSuffix: true,
  });

  return (
    <>
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-border hover:bg-card hover:shadow-md">
        {/* Accent Color Header Line */}
        <div
          className="absolute inset-x-0 top-0 h-1.5 transition-opacity group-hover:opacity-100"
          style={{ backgroundColor: course.color }}
        />

        {/* Top Info & Actions */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/courses/${course.id}`}
              className="flex-1 space-y-1 group/title"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
                <h3 className="font-semibold text-foreground text-lg tracking-tight transition-colors group-hover/title:text-primary line-clamp-1">
                  {course.title}
                </h3>
              </div>
            </Link>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100"
                  aria-label="Course options"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-2"
                  >
                    <FolderOpen className="size-4 text-muted-foreground" />
                    Open Workspace
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="size-4 text-muted-foreground" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 min-h-[2rem] leading-relaxed">
            {course.description || "No course description provided."}
          </p>
        </div>

        {/* Bottom Section: Resource Metrics & Link */}
        <div className="mt-6 space-y-4 border-t border-border/40 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/40 p-2 transition-colors hover:bg-muted/70">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <FileText className="size-3.5 text-blue-400" />
                {course.stats.documentCount}
              </span>
              <span className="text-[10px] text-muted-foreground">documents</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/40 p-2 transition-colors hover:bg-muted/70">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Layers className="size-3.5 text-purple-400" />
                {course.stats.deckCount}
              </span>
              <span className="text-[10px] text-muted-foreground">decks</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/40 p-2 transition-colors hover:bg-muted/70">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <HelpCircle className="size-3.5 text-emerald-400" />
                {course.stats.quizCount}
              </span>
              <span className="text-[10px] text-muted-foreground">quizzes</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="size-3" />
              Last active {formattedDate}
            </span>

            <Link
              href={`/courses/${course.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Open Course
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      <EditCourseDialog
        course={course}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteCourseDialog
        course={course}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
