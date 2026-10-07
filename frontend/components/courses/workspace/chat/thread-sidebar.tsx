"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  History,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import type { ThreadListItem } from "@/data/chat";

interface ThreadSidebarProps {
  threads: ThreadListItem[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onRenameThread: (threadId: string, newTitle: string) => Promise<void>;
  onDeleteThread: (threadId: string) => Promise<void>;
  isCreatingNew?: boolean;
  className?: string;
}

function formatRelativeTime(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ThreadSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onRenameThread,
  onDeleteThread,
  isCreatingNew = false,
  className,
}: ThreadSidebarProps) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStartRename = (thread: ThreadListItem) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const handleCancelRename = () => {
    setEditingThreadId(null);
    setEditingTitle("");
  };

  const handleConfirmRename = async (threadId: string) => {
    if (!editingTitle.trim() || isRenaming) return;
    try {
      setIsRenaming(true);
      await onRenameThread(threadId, editingTitle.trim());
      setEditingThreadId(null);
      setEditingTitle("");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingThreadId || isDeleting) return;
    try {
      setIsDeleting(true);
      await onDeleteThread(deletingThreadId);
      setDeletingThreadId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-border/70 bg-card/40 w-64 lg:w-72 shrink-0 select-none",
        className
      )}
    >
      {/* Top Header & New Chat Button */}
      <div className="p-3 border-b border-border/60">
        <Button
          onClick={onNewChat}
          disabled={isCreatingNew}
          className="w-full justify-start gap-2 h-9 text-xs font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isCreatingNew ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          <span>New Chat</span>
        </Button>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <History className="size-7 stroke-[1.5] mb-2 opacity-50" />
            <p className="text-xs font-medium text-foreground">No chats yet</p>
            <p className="text-[11px] mt-0.5 text-muted-foreground leading-relaxed">
              Start your first conversation with your AI study tutor.
            </p>
          </div>
        ) : (
          threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            const isEditing = editingThreadId === thread.id;

            if (isEditing) {
              return (
                <div
                  key={thread.id}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg border border-primary/40 bg-accent/60"
                >
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmRename(thread.id);
                      if (e.key === "Escape") handleCancelRename();
                    }}
                    autoFocus
                    disabled={isRenaming}
                    className="h-7 text-xs px-2 py-0"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleConfirmRename(thread.id)}
                    disabled={isRenaming}
                    className="size-6 text-primary hover:bg-primary/10 shrink-0"
                  >
                    <Check className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelRename}
                    disabled={isRenaming}
                    className="size-6 text-muted-foreground hover:bg-muted shrink-0"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              );
            }

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={cn(
                  "group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium border border-border/80 shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                  <MessageSquare
                    className={cn(
                      "size-3.5 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground/70"
                    )}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-xs leading-snug">
                      {thread.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/80 font-normal">
                      {formatRelativeTime(thread.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                      >
                        <MoreVertical className="size-3.5" />
                        <span className="sr-only">Thread actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => handleStartRename(thread)}
                        className="text-xs cursor-pointer gap-2"
                      >
                        <Pencil className="size-3.5" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingThreadId(thread.id)}
                        className="text-xs cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingThreadId}
        onOpenChange={(open) => !open && setDeletingThreadId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat thread and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Chat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
