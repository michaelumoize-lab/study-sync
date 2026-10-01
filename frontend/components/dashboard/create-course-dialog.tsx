"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createCourse } from "@/actions/courses";
import {
  COURSE_COLOR_PRESETS,
  DEFAULT_COURSE_COLOR,
  type CreateCourseInput,
} from "@/types/course";
import { Plus, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateCourseDialogProps {
  courseCount: number;
  maxCourses?: number;
  trigger?: React.ReactNode;
}

export function CreateCourseDialog({
  courseCount,
  maxCourses = 5,
  trigger,
}: CreateCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COURSE_COLOR);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isAtQuota = courseCount >= maxCourses;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedColor(DEFAULT_COURSE_COLOR);
    setFieldErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!title.trim()) {
      setFieldErrors({ title: ["Course title is required."] });
      return;
    }

    startTransition(async () => {
      const payload: CreateCourseInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      };

      const result = await createCourse(payload);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        toast.error(result.error);
        return;
      }

      toast.success("Course created successfully!");
      resetForm();
      setOpen(false);

      // Navigate to the newly created course workspace
      router.push(`/courses/${result.data.id}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            disabled={isAtQuota}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>Create Course</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: selectedColor }}
              />
              <DialogTitle className="text-xl font-bold tracking-tight">
                Create Course Workspace
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Create a dedicated study environment for lecture slides, notes,
              and grounded AI study sessions.
            </DialogDescription>
          </DialogHeader>

          {isAtQuota && (
            <div className="my-3 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                You have reached your Free Tier limit of {maxCourses} courses.
                Delete an existing course to create a new one.
              </span>
            </div>
          )}

          <div className="space-y-4 py-3">
            {/* Title Input */}
            <div className="space-y-1.5">
              <Label htmlFor="course-title" className="text-xs font-semibold">
                Course Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="course-title"
                placeholder="e.g. CS 106B: Programming Abstractions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending || isAtQuota}
                maxLength={80}
                className={cn(
                  "h-10",
                  fieldErrors.title && "border-destructive focus-visible:ring-destructive"
                )}
                autoFocus
              />
              {fieldErrors.title?.[0] && (
                <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <Label htmlFor="course-desc" className="text-xs font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="course-desc"
                placeholder="Topics, professor, syllabus notes, or semester details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending || isAtQuota}
                maxLength={300}
                rows={3}
                className="resize-none text-sm"
              />
              {fieldErrors.description?.[0] && (
                <p className="text-xs text-destructive">
                  {fieldErrors.description[0]}
                </p>
              )}
            </div>

            {/* Color Swatch Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Workspace Accent Color
              </Label>
              <div className="flex flex-wrap items-center gap-2.5">
                {COURSE_COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedColor === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      disabled={isPending || isAtQuota}
                      onClick={() => setSelectedColor(preset.value)}
                      title={preset.name}
                      className={cn(
                        "relative size-7 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 scale-110"
                          : "opacity-75 hover:opacity-100 hover:scale-105"
                      )}
                      style={{ backgroundColor: preset.value }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="size-1.5 rounded-full bg-white shadow-xs" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isAtQuota || !title.trim()}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Create Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
