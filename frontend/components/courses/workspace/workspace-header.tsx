"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Share2,
  MoreVertical,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditCourseDialog } from "@/components/dashboard/edit-course-dialog";
import { DeleteCourseDialog } from "@/components/dashboard/delete-course-dialog";
import { PdfUploadDialog } from "./pdf-upload-dialog";
import type { CourseWithStats } from "@/types/course";

interface WorkspaceHeaderProps {
  course: CourseWithStats;
}

export function WorkspaceHeader({ course }: WorkspaceHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Course workspace link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy link to clipboard.");
      }
    }
  };

  return (
    <>
      <div className="space-y-4 pb-6 border-b border-border/40">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground -ml-2"
          >
            <Link href="/courses">
              <ArrowLeft className="size-3.5" />
              <span>Back to Courses</span>
            </Link>
          </Button>
        </div>

        {/* Title, Accent, and Action Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="size-3.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: course.color }}
              />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {course.title}
              </h1>
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {course.description ||
                "No description provided for this course. Upload lecture PDFs or syllabi to get started."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <PdfUploadDialog
              courseId={course.id}
              courseSlug={course.slug}
              courseTitle={course.title}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
              <span>Edit Course</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl text-muted-foreground hover:text-foreground"
                  aria-label="Course settings"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
                  {copied ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Share2 className="size-4 text-muted-foreground" />
                  )}
                  <span>Copy Course Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditOpen(true)}
                  className="gap-2 cursor-pointer"
                >
                  <Pencil className="size-4 text-muted-foreground" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  <span>Delete Course</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
