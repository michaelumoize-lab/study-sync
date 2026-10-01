"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteCourse } from "@/actions/courses";
import type { CourseWithStats } from "@/types/course";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteCourseDialogProps {
  course: CourseWithStats;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCourseDialog({
  course,
  open,
  onOpenChange,
}: DeleteCourseDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCourse(course.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`"${course.title}" and associated study files deleted.`);
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            <AlertDialogTitle>Delete Course Workspace?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground pt-1">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{course.title}&quot;
            </span>
            ? This action cannot be undone. All{" "}
            {course.stats.documentCount} uploaded documents, vector embeddings,
            chat threads, and flashcard decks associated with this course will be
            permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete Course
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
