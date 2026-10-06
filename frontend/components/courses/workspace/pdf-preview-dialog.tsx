"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, type DocumentItem } from "@/types/document";
import {
  FileText,
  ExternalLink,
  Download,
  Loader2,
  X,
  Maximize2,
} from "lucide-react";

interface PdfPreviewDialogProps {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfPreviewDialog({
  document,
  open,
  onOpenChange,
}: PdfPreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!document) return null;

  const previewUrl = `/api/documents/${document.id}/preview`;
  const downloadUrl = `/api/documents/${document.id}/preview?download=1`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-5xl w-[96vw] h-[90vh] max-h-[920px] p-0 flex flex-col gap-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl"
      >
        {/* Top Header Bar */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/70 px-5 py-3.5 space-y-0 shrink-0 bg-card/60">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-4.5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-foreground truncate max-w-sm sm:max-w-md md:max-w-lg">
                {document.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{formatFileSize(document.fileSizeBytes)}</span>
                {document.pageCount > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {document.pageCount}{" "}
                      {document.pageCount === 1 ? "page" : "pages"}
                    </span>
                  </>
                )}
                <Badge
                  variant="outline"
                  className="ml-1 h-5 px-1.5 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                >
                  Indexed
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 gap-1.5 rounded-lg text-xs font-medium"
            >
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">New Tab</span>
              </a>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 gap-1.5 rounded-lg text-xs font-medium"
            >
              <a href={downloadUrl} download>
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Close preview"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Embedded PDF Viewer Container */}
        <div className="relative flex-1 w-full h-full bg-muted/20 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-xs z-10">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">
                Loading PDF document...
              </p>
            </div>
          )}

          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=0`}
            title={`Preview of ${document.title}`}
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
