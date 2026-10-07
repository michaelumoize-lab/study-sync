"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check, RotateCcw, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatCitation } from "@/db/schema/chat";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  status?: "complete" | "stopped" | "error";
  model?: string | null;
  citations?: ChatCitation[] | null;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
  onCitationClick?: (citation: ChatCitation) => void;
}

export function MessageBubble({
  role,
  content,
  status = "complete",
  model,
  citations,
  isLastAssistant = false,
  onRegenerate,
  onCitationClick,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // User Message
  if (role === "user") {
    return (
      <div className="flex justify-end w-full mb-4">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-primary px-4 py-3 text-sm text-primary-foreground shadow-xs">
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex flex-col w-full mb-6 group">
      <div className="flex items-start gap-3 w-full">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20 mt-1">
          <Sparkles className="size-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Main Markdown Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed break-words">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
              components={{
                // Transform citations [1], [2] inside text if citations exist
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                code: ({ className, children, ...props }: any) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground font-medium" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="relative my-3 rounded-xl overflow-hidden border border-border/80 bg-zinc-950 dark:bg-zinc-900">
                      <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-100">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
                table: ({ children }) => (
                  <div className="my-4 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-xs text-left border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-muted/60 p-2 font-semibold border-b border-border">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="p-2 border-b border-border/50">{children}</td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Stopped warning badge */}
          {status === "stopped" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-[11px] text-muted-foreground">
              <AlertTriangle className="size-3 text-amber-400" />
              <span>Generation stopped</span>
            </div>
          )}

          {/* Citations Footer Section */}
          {citations && citations.length > 0 && (
            <div className="pt-2 border-t border-border/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText className="size-3" />
                <span>Cited Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {citations.map((c) => {
                  if (c.isDetached) {
                    return (
                      <Badge
                        key={c.index}
                        variant="outline"
                        className="h-6 px-2 text-xs gap-1.5 border-dashed border-muted-foreground/30 text-muted-foreground/60 cursor-not-allowed"
                        title="This document was removed from the course"
                      >
                        <span className="font-semibold">[{c.index}]</span>
                        <span className="truncate max-w-[120px]">{c.documentTitle}</span>
                        <span className="text-[10px] italic">(removed)</span>
                      </Badge>
                    );
                  }

                  return (
                    <button
                      key={c.index}
                      type="button"
                      onClick={() => onCitationClick?.(c)}
                      className={cn(
                        "group/cit inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-xs font-medium",
                        "bg-primary/10 text-primary border border-primary/20",
                        "hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer shadow-2xs"
                      )}
                      title={`Open ${c.documentTitle} at page ${c.pageNumber}`}
                    >
                      <span className="font-bold">[{c.index}]</span>
                      <span className="truncate max-w-[140px] font-medium">{c.documentTitle}</span>
                      <span className="text-[10px] opacity-75 font-mono">p.{c.pageNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="flex items-center gap-1 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground h-7 w-7 rounded-lg"
              title="Copy message"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            </Button>

            {isLastAssistant && onRegenerate && (
              <Button
                variant="ghost"
                size="xs"
                onClick={onRegenerate}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7 px-2 rounded-lg"
                title="Regenerate response"
              >
                <RotateCcw className="size-3.5" />
                <span className="text-[11px]">Regenerate</span>
              </Button>
            )}

            {model && (
              <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">
                {model.replace("models/", "")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
