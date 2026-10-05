"use client";

import { useState, useMemo } from "react";
import { Search, X, FileUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "./document-card";
import { DocumentsEmptyState } from "./documents-empty-state";
import { PdfUploadDialog } from "./pdf-upload-dialog";
import type { DocumentItem } from "@/types/document";

interface DocumentListProps {
  documents: DocumentItem[];
  courseId: string;
  courseSlug: string;
  courseTitle: string;
}

export function DocumentList({
  documents,
  courseId,
  courseSlug,
  courseTitle,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => doc.title.toLowerCase().includes(q));
  }, [documents, searchQuery]);

  if (documents.length === 0) {
    return (
      <DocumentsEmptyState
        courseId={courseId}
        courseSlug={courseSlug}
        courseTitle={courseTitle}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Document toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title..."
            className="pl-9 pr-9 h-9 rounded-xl bg-card/60 border-border/70 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear document search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-muted-foreground">
            {filteredDocuments.length}{" "}
            {filteredDocuments.length === 1 ? "document" : "documents"}
          </span>

          <PdfUploadDialog
            courseId={courseId}
            courseSlug={courseSlug}
            courseTitle={courseTitle}
            trigger={
              <Button size="sm" className="gap-1.5 rounded-xl text-xs font-semibold shadow-xs">
                <FileUp className="size-3.5" />
                <span>Upload PDF</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Documents items */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              courseSlug={courseSlug}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
          No documents match &ldquo;{searchQuery}&rdquo;.
          <Button
            variant="link"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="ml-2 text-xs"
          >
            Clear filter
          </Button>
        </div>
      )}
    </div>
  );
}
