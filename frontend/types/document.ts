export type DocumentStatus =
  | "UPLOADING"
  | "UPLOADED"
  | "PROCESSING"
  | "STALE_RETRYABLE"
  | "READY"
  | "FAILED";

export interface DocumentItem {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  r2Key: string;
  fileSizeBytes: number;
  pageCount: number;
  status: DocumentStatus;
  errorMessage: string | null;
  processingStartedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Format bytes into human-readable string (e.g. 2.4 MB, 840 KB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}
