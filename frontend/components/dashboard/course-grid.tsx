"use client";

import { useState, useMemo } from "react";
import { CourseCard } from "./course-card";
import { EmptyCourses } from "./empty-courses";
import { Input } from "@/components/ui/input";
import type { CourseWithStats } from "@/types/course";
import { Search, BookOpen } from "lucide-react";

interface CourseGridProps {
  courses: CourseWithStats[];
}

export function CourseGrid({ courses }: CourseGridProps) {
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

  if (courses.length === 0) {
    return <EmptyCourses courseCount={0} />;
  }

  return (
    <div className="space-y-6">
      {/* Search Filter Bar (if 2 or more courses exist) */}
      {courses.length > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter courses by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9.5 pl-9 text-xs sm:text-sm bg-background/50 rounded-xl"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredCourses.length}
            </span>{" "}
            of {courses.length} courses
          </div>
        </div>
      )}

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
    </div>
  );
}
