"use client";

import { useState, useEffect, useTransition } from "react";
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
  HelpCircle,
  Eye,
  ExternalLink,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { formatFileSize, type DocumentItem, type DocumentStatus } from "@/types/document";
import { cn } from "@/lib/utils";
import { PdfPreviewDialog } from "./pdf-preview-dialog";

interface DocumentCardProps {
  document: DocumentItem;
  courseSlug: string;
}

export function DocumentCard({ document, courseSlug }: DocumentCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  // Local live status tracking
  const [currentStatus, setCurrentStatus] = useState<DocumentStatus>(document.status);
  const [pageCount, setPageCount] = useState<number>(document.pageCount);
  const [errorMessage, setErrorMessage] = useState<string | null>(document.errorMessage);

  const formattedDate = formatDistanceToNow(new Date(document.createdAt), {
    addSuffix: true,
  });

  // Short-polling effect while document is not yet finalized
  useEffect(() => {
    if (currentStatus !== "PROCESSING" && currentStatus !== "UPLOADING" && currentStatus !== "UPLOADED") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/${document.id}/status`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status) {
          setCurrentStatus(data.status);
          if (data.pageCount) setPageCount(data.pageCount);
          if (data.errorMessage) setErrorMessage(data.errorMessage);

          if (data.status === "READY") {
            toast.success(`"${document.title}" is ready for studying!`);
          } else if (data.status === "FAILED") {
            toast.error(`"${document.title}": ${data.errorMessage || "Processing failed."}`);
          }
        }
      } catch (err) {
        console.warn("Error polling document status:", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [document.id, document.title, currentStatus]);

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
    switch (currentStatus) {
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
            <span>Processing...</span>
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
            <span>Uploaded</span>
          </Badge>
        );
      case "FAILED":
        return (
          <Badge
            variant="outline"
            title={errorMessage || "Processing failed"}
            className="gap-1 border-red-500/30 bg-red-500/10 text-red-400 text-[11px] cursor-help"
          >
            <AlertCircle className="size-3" />
            <span>Failed</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px]">
            {currentStatus}
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-4 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              onClick={() => currentStatus === "READY" && setPreviewOpen(true)}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition-all",
                currentStatus === "READY" &&
                  "cursor-pointer hover:scale-105 hover:bg-red-500/20"
              )}
              title={currentStatus === "READY" ? "Click to preview PDF" : undefined}
            >
              <FileText className="size-5" />
            </div>

            <div className="min-w-0">
              <h4
                onClick={() => currentStatus === "READY" && setPreviewOpen(true)}
                className={cn(
                  "font-semibold text-sm text-foreground truncate max-w-[240px] sm:max-w-md",
                  currentStatus === "READY" &&
                    "cursor-pointer hover:text-primary transition-colors"
                )}
                title={currentStatus === "READY" ? "Click to preview PDF" : document.title}
              >
                {document.title}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(document.fileSizeBytes)}</span>
                {pageCount > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {pageCount} {pageCount === 1 ? "page" : "pages"}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{formattedDate}</span>
              </div>

              {/* Failure explanation banner if failed */}
              {currentStatus === "FAILED" && errorMessage && (
                <p className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20 leading-relaxed">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {renderStatusBadge()}

            {currentStatus === "READY" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
                className="h-7 gap-1 px-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted hidden sm:inline-flex"
              >
                <Eye className="size-3.5" />
                <span>Preview</span>
              </Button>
            )}

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
              <DropdownMenuContent align="end" className="w-44">
                {currentStatus === "READY" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setPreviewOpen(true)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="size-4 text-muted-foreground" />
                      <span>Preview PDF</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <a
                        href={`/api/documents/${document.id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="size-4 text-muted-foreground" />
                        <span>Open in New Tab</span>
                      </a>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <a
                        href={`/api/documents/${document.id}/preview?download=1`}
                        download
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="size-4 text-muted-foreground" />
                        <span>Download PDF</span>
                      </a>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                  </>
                )}

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

      {/* PDF Preview Dialog Modal */}
      <PdfPreviewDialog
        document={document}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{document.title}</strong>? Any
              associated study flashcards or references will need to be re-indexed,
              and the file will be purged from storage.
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
