"use client";

import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseCard } from "@/components/dashboard/course-card";
import { CoursesEmptyState } from "./courses-empty-state";
import type { CourseWithStats } from "@/types/course";

interface CoursesListViewProps {
  initialCourses: CourseWithStats[];
}

type SortOption = "updated" | "created" | "az" | "za" | "documents";

export function CoursesListView({ initialCourses }: CoursesListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");

  const filteredAndSortedCourses = useMemo(() => {
    let result = [...initialCourses];

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "documents":
          return b.stats.documentCount - a.stats.documentCount;
        default:
          return 0;
      }
    });

    return result;
  }, [initialCourses, searchQuery, sortBy]);

  // If user has no courses at all
  if (initialCourses.length === 0) {
    return <CoursesEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by name or topic..."
            className="pl-9 pr-9 h-10 rounded-xl bg-card/60 border-border/70 focus-visible:ring-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-sm"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground hidden sm:inline-block" />
          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy(val as SortOption)}
          >
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-card/60 border-border/70 text-xs">
              <SelectValue placeholder="Sort courses" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="created">Recently created</SelectItem>
              <SelectItem value="az">Alphabetical (A – Z)</SelectItem>
              <SelectItem value="za">Alphabetical (Z – A)</SelectItem>
              <SelectItem value="documents">Most documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Count / Filter status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filteredAndSortedCourses.length}{" "}
          {filteredAndSortedCourses.length === 1 ? "course" : "courses"}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </span>
      </div>

      {/* Grid of Courses or Search Empty State */}
      {filteredAndSortedCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/20 p-8 text-center">
          <BookOpen className="size-10 text-muted-foreground/60 mb-3" />
          <h4 className="text-base font-semibold text-foreground">
            No courses found
          </h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            No courses match the search filter &ldquo;{searchQuery}&rdquo;. Try another
            keyword or clear your filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-4 rounded-xl text-xs"
          >
            Clear Filter
          </Button>
        </div>
      )}
    </div>
  );
}
