"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createDocumentAction } from "@/actions/documents";
import { formatFileSize } from "@/types/document";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfUploadDialogProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

type UploadState = "IDLE" | "SELECTED" | "UPLOADING" | "PROCESSING" | "READY" | "ERROR";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export function PdfUploadDialog({
  courseId,
  courseSlug,
  courseTitle,
  trigger,
  onSuccess,
}: PdfUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<UploadState>("IDLE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setState("IDLE");
    setSelectedFile(null);
    setUploadProgress(0);
    setErrorMessage(null);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent accidental close during active upload or processing
    if (!newOpen && (state === "UPLOADING" || state === "PROCESSING")) {
      return;
    }
    setOpen(newOpen);
    if (!newOpen) {
      resetState();
    }
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);

    // 1. Validate file format (must be PDF)
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage("Please select a valid PDF file. Other file formats are not supported yet.");
      setState("ERROR");
      return;
    }

    // 2. Validate file size (max 50 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatFileSize(file.size)}). The maximum allowed file size is 50 MB.`
      );
      setState("ERROR");
      return;
    }

    if (file.size === 0) {
      setErrorMessage("The selected PDF file is empty (0 bytes).");
      setState("ERROR");
      return;
    }

    setSelectedFile(file);
    setState("SELECTED");
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSelectFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  // Perform upload simulation and persistence
  const startUpload = async () => {
    if (!selectedFile) return;

    setState("UPLOADING");
    setUploadProgress(10);

    // Smooth upload progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 150);

    try {
      // Simulate network transmission delay
      await new Promise((resolve) => setTimeout(resolve, 1100));
      clearInterval(progressInterval);
      setUploadProgress(100);

      setState("PROCESSING");
      // Simulate indexing/chunking step
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Clean course title from file name (strip .pdf extension)
      const cleanTitle = selectedFile.name.replace(/\.pdf$/i, "").trim();

      // Persist to Neon DB via server action
      const result = await createDocumentAction({
        courseId,
        courseSlug,
        title: cleanTitle,
        fileSizeBytes: selectedFile.size,
        status: "READY",
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setState("READY");
      toast.success(`"${cleanTitle}" uploaded and indexed successfully!`);
      onSuccess?.();
    } catch (err: unknown) {
      clearInterval(progressInterval);
      const msg = err instanceof Error ? err.message : "Failed to upload document.";
      setErrorMessage(msg);
      setState("ERROR");
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 rounded-xl text-xs font-semibold shadow-xs">
            <Upload className="size-4" />
            <span>Upload PDF</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FileUp className="size-5 text-primary" />
            Upload Course Materials
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload lecture slides, chapters, or notes to <strong className="text-foreground">{courseTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* State 1: IDLE - Dropzone */}
        {state === "IDLE" && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200",
              isDragOver
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border/80 hover:border-primary/60 hover:bg-muted/30"
            )}
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Upload className="size-6" />
            </div>

            <p className="mt-4 text-sm font-semibold text-foreground">
              Drag and drop your PDF here, or{" "}
              <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Supports PDF documents up to 50 MB
            </p>

            <div className="mt-4 flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground">
              <Sparkles className="size-3 text-amber-400" />
              <span>AI Tutor will automatically index key concepts & quiz content</span>
            </div>
          </div>
        )}

        {/* State 2: SELECTED - Confirmation preview */}
        {state === "SELECTED" && selectedFile && (
          <div className="space-y-5 py-2">
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <FileText className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground max-w-[280px] truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • PDF Document
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={resetState}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Remove selected file"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={resetState}
                className="rounded-xl text-xs"
              >
                Choose Different File
              </Button>
              <Button
                size="sm"
                onClick={startUpload}
                className="gap-2 rounded-xl text-xs font-semibold shadow-xs"
              >
                <Upload className="size-3.5" />
                <span>Upload & Index</span>
              </Button>
            </div>
          </div>
        )}

        {/* State 3: UPLOADING - Progress bar */}
        {state === "UPLOADING" && (
          <div className="space-y-4 py-6 text-center">
            <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="size-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-foreground">
                Uploading document...
              </h4>
              <p className="text-xs text-muted-foreground">
                {selectedFile?.name} ({uploadProgress}%)
              </p>
            </div>

            <div className="w-full px-4">
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        )}

        {/* State 4: PROCESSING - Chunker & Embedder */}
        {state === "PROCESSING" && (
          <div className="space-y-4 py-6 text-center">
            <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <Loader2 className="size-6 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-foreground">
                Processing & indexing content...
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Parsing pages and building AI study index for your flashcards and tutor.
              </p>
            </div>
          </div>
        )}

        {/* State 5: READY - Success */}
        {state === "READY" && (
          <div className="space-y-4 py-6 text-center">
            <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-foreground">
                Document ready for studying!
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {selectedFile?.name} is ready. You can now generate flashcards, practice quizzes, or study with your AI Tutor.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetState}
                className="rounded-xl text-xs"
              >
                Upload Another PDF
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* State 6: ERROR - Failure */}
        {state === "ERROR" && (
          <div className="space-y-4 py-6 text-center">
            <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-foreground">
                Upload failed
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {errorMessage || "An unexpected error occurred while uploading your document."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetState}
                className="rounded-xl text-xs"
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="rounded-xl text-xs text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
