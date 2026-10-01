"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateCourse } from "@/actions/courses";
import {
  COURSE_COLOR_PRESETS,
  type CourseWithStats,
  type UpdateCourseInput,
} from "@/types/course";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditCourseDialogProps {
  course: CourseWithStats;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCourseDialog({
  course,
  open,
  onOpenChange,
}: EditCourseDialogProps) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || "");
  const [selectedColor, setSelectedColor] = useState(course.color);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!title.trim()) {
      setFieldErrors({ title: ["Course title is required."] });
      return;
    }

    startTransition(async () => {
      const payload: UpdateCourseInput = {
        id: course.id,
        title: title.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      };

      const result = await updateCourse(payload);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        toast.error(result.error);
        return;
      }

      toast.success("Course details updated.");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: selectedColor }}
              />
              <DialogTitle className="text-xl font-bold tracking-tight">
                Edit Course Workspace
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Modify the subject title, description, or workspace theme color.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-course-title" className="text-xs font-semibold">
                Course Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-course-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                maxLength={80}
                className={cn(
                  "h-10",
                  fieldErrors.title && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {fieldErrors.title?.[0] && (
                <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-course-desc" className="text-xs font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="edit-course-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
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
                      disabled={isPending}
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
