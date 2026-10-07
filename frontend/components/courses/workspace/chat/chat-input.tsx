"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Square,
  Filter,
  FileText,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types/document";

interface ChatInputProps {
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  onSelectDocument: (docId: string | null) => void;
  onSubmit: (prompt: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_CHARS = 4000;

export function ChatInput({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onSubmit,
  onStop,
  isStreaming,
  disabled = false,
  placeholder = "Ask anything about your course materials...",
}: ChatInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const readyDocs = documents.filter((d) => d.status === "READY");
  const selectedDoc = readyDocs.find((d) => d.id === selectedDocumentId);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isStreaming) {
      onStop();
      return;
    }
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || disabled) return;
    onSubmit(cleanPrompt);
    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Scope Selector Bar */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isStreaming || readyDocs.length === 0}
                className={cn(
                  "h-6 px-2 text-[11px] font-normal gap-1 rounded-full border-border/80 transition-colors",
                  selectedDoc
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Filter className="size-3" />
                <span className="truncate max-w-[160px]">
                  {selectedDoc ? selectedDoc.title : "All Course Materials"}
                </span>
                <ChevronDown className="size-2.5 opacity-60 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground font-medium">
                Scope Tutor Knowledge
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onSelectDocument(null)}
                className="text-xs cursor-pointer gap-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span>All Course Materials</span>
                  {!selectedDocumentId && <Check className="size-3.5 text-primary" />}
                </div>
              </DropdownMenuItem>

              {readyDocs.length > 0 && <DropdownMenuSeparator />}

              {readyDocs.map((doc) => (
                <DropdownMenuItem
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className="text-xs cursor-pointer gap-2"
                >
                  <FileText className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1">{doc.title}</span>
                  {selectedDocumentId === doc.id && (
                    <Check className="size-3.5 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedDoc && (
            <Badge
              variant="secondary"
              className="h-6 px-1.5 text-[10px] gap-1 rounded-full bg-muted/80 text-muted-foreground font-normal hover:bg-muted cursor-pointer"
              onClick={() => onSelectDocument(null)}
            >
              <span>Clear Filter</span>
              <X className="size-2.5" />
            </Badge>
          )}
        </div>

        {prompt.length > 1000 && (
          <span
            className={cn(
              "text-[10px] tabular-nums",
              prompt.length > MAX_CHARS - 200
                ? "text-destructive font-semibold"
                : "text-muted-foreground"
            )}
          >
            {prompt.length} / {MAX_CHARS}
          </span>
        )}
      </div>

      {/* Input Text Box */}
      <div className="relative flex items-end gap-2 rounded-2xl border border-border/80 bg-background/95 p-2 shadow-xs focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled && !isStreaming}
          rows={1}
          className="flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden min-h-[44px] max-h-[160px] leading-relaxed scrollbar-thin"
        />

        <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              onClick={onStop}
              aria-label="Stop generating"
              className="size-8 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-transform active:scale-95 shadow-2xs"
            >
              <Square className="size-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!prompt.trim() || disabled}
              aria-label="Send prompt"
              className="size-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 shadow-2xs disabled:opacity-40"
            >
              <ArrowUp className="size-4 stroke-[2.5]" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
