"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  FileText,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteDocumentAction } from "@/actions/documents";
import { formatFileSize, type DocumentItem } from "@/types/document";

interface DocumentCardProps {
  document: DocumentItem;
  courseSlug: string;
}

export function DocumentCard({ document, courseSlug }: DocumentCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const formattedDate = formatDistanceToNow(new Date(document.createdAt), {
    addSuffix: true,
  });

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteDocumentAction(document.id, courseSlug);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Document removed successfully.");
      setDeleteOpen(false);
    });
  };

  const renderStatusBadge = () => {
    switch (document.status) {
      case "READY":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px]"
          >
            <CheckCircle2 className="size-3" />
            <span>Ready</span>
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-blue-500/30 bg-blue-500/10 text-blue-400 text-[11px]"
          >
            <Loader2 className="size-3 animate-spin" />
            <span>Processing</span>
          </Badge>
        );
      case "UPLOADING":
      case "UPLOADED":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-400 text-[11px]"
          >
            <Clock className="size-3" />
            <span>Uploading</span>
          </Badge>
        );
      case "FAILED":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-red-500/30 bg-red-500/10 text-red-400 text-[11px]"
          >
            <AlertCircle className="size-3" />
            <span>Failed</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px]">
            {document.status}
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-4 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <FileText className="size-5" />
            </div>

            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate max-w-[240px] sm:max-w-md">
                {document.title}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(document.fileSizeBytes)}</span>
                {document.pageCount > 0 && (
                  <>
                    <span>•</span>
                    <span>{document.pageCount} pages</span>
                  </>
                )}
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {renderStatusBadge()}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground opacity-70 group-hover:opacity-100"
                  aria-label="Document options"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  <span>Delete Document</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{document.title}</strong>? Any
              associated study flashcards or references will need to be re-indexed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Document"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
