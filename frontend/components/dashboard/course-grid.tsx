"use client";

import { useState, useMemo } from "react";
import { CourseCard } from "./course-card";
import { CreateCourseDialog } from "./create-course-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CourseWithStats } from "@/types/course";
import { Search, BookOpen, Plus } from "lucide-react";

interface CourseGridProps {
  courses: CourseWithStats[];
  maxCourses?: number;
}

export function CourseGrid({ courses, maxCourses = 5 }: CourseGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
    );
  }, [courses, searchQuery]);

  const isAtQuota = courses.length >= maxCourses;

  return (
    <section id="courses" className="mb-14 sm:mb-16 space-y-6" aria-labelledby="your-courses-heading">
      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2
            id="your-courses-heading"
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Your Courses
          </h2>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {courses.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {courses.length > 2 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-xl bg-background/50 pl-8.5 text-xs"
              />
            </div>
          )}

          <CreateCourseDialog
            courseCount={courses.length}
            maxCourses={maxCourses}
            trigger={
              <Button
                variant="outline"
                size="sm"
                disabled={isAtQuota}
                className="h-9 gap-1.5 rounded-xl border-border/70 text-xs font-medium hover:bg-muted"
              >
                <Plus className="size-3.5" />
                <span>Create Course</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Grid of Courses */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <BookOpen className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">
            No courses match &quot;{searchQuery}&quot;
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search query or clear the filter.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}
    </section>
  );
}
