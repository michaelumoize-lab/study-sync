"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  History,
  RotateCcw,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThreadSidebar } from "./thread-sidebar";
import { ChatInput } from "./chat-input";
import { ChatEmptyState } from "./chat-empty-state";
import { MessageBubble } from "./message-bubble";
import { PdfPreviewDialog } from "@/components/courses/workspace/pdf-preview-dialog";
import {
  createThreadAction,
  renameThreadAction,
  deleteThreadAction,
  prepareRegenerateAction,
  getThreadMessagesAction,
} from "@/actions/chat";
import type { ThreadListItem, EnrichedChatMessage } from "@/data/chat";
import type { DocumentItem } from "@/types/document";
import type { CourseWithStats } from "@/types/course";
import type { ChatCitation } from "@/db/schema/chat";

interface CourseChatViewProps {
  course: CourseWithStats;
  documents: DocumentItem[];
  initialThreads?: ThreadListItem[];
  initialThreadId?: string;
  initialMessages?: EnrichedChatMessage[];
}

export function CourseChatView({
  course,
  documents,
  initialThreads = [],
  initialThreadId,
  initialMessages = [],
}: CourseChatViewProps) {
  const searchParams = useSearchParams();
  const urlThreadId = searchParams.get("thread");

  const [threads, setThreads] = useState<ThreadListItem[]>(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    urlThreadId || initialThreadId || (initialThreads[0]?.id ?? null)
  );
  const [messages, setMessages] = useState<EnrichedChatMessage[]>(initialMessages);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Layout State
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Citation Preview Dialog State
  const [previewCitation, setPreviewCitation] = useState<ChatCitation | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync URL when activeThreadId changes
  const updateUrlThread = (threadId: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (threadId) {
      url.searchParams.set("thread", threadId);
    } else {
      url.searchParams.delete("thread");
    }
    window.history.replaceState({}, "", url.toString());
  };

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Fetch messages when switching threads
  const loadThreadMessages = useCallback(
    async (threadId: string) => {
      try {
        setIsLoadingMessages(true);
        const res = await getThreadMessagesAction(threadId);
        if (res.success && res.data) {
          setMessages(res.data.messages);
        } else {
          toast.error("Could not load thread messages");
        }
      } catch (err) {
        console.error("Failed to load thread messages:", err);
        toast.error("Network error loading messages");
      } finally {
        setIsLoadingMessages(false);
        setTimeout(() => scrollToBottom(false), 50);
      }
    },
    [scrollToBottom]
  );

  // Initial load if active thread is set and messages are empty
  useEffect(() => {
    if (activeThreadId && messages.length === 0 && !isLoadingMessages) {
      loadThreadMessages(activeThreadId);
    }
  }, [activeThreadId, loadThreadMessages]);

  // Handle Thread Selection
  const handleSelectThread = async (threadId: string) => {
    if (threadId === activeThreadId || isStreaming) return;
    setActiveThreadId(threadId);
    updateUrlThread(threadId);
    setMobileSheetOpen(false);
    await loadThreadMessages(threadId);
  };

  // Handle New Chat Click
  const handleNewChat = () => {
    if (isStreaming) return;
    setActiveThreadId(null);
    setMessages([]);
    updateUrlThread(null);
    setMobileSheetOpen(false);
  };

  // Handle Thread Rename
  const handleRenameThread = async (threadId: string, newTitle: string) => {
    const res = await renameThreadAction(threadId, newTitle);
    if (res.success) {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title: newTitle } : t))
      );
      toast.success("Thread renamed");
    } else {
      toast.error(res.error || "Failed to rename thread");
    }
  };

  // Handle Thread Delete
  const handleDeleteThread = async (threadId: string) => {
    const res = await deleteThreadAction(threadId, course.slug);
    if (res.success) {
      const remaining = threads.filter((t) => t.id !== threadId);
      setThreads(remaining);
      toast.success("Conversation deleted");

      if (activeThreadId === threadId) {
        if (remaining.length > 0) {
          setActiveThreadId(remaining[0].id);
          updateUrlThread(remaining[0].id);
          loadThreadMessages(remaining[0].id);
        } else {
          setActiveThreadId(null);
          setMessages([]);
          updateUrlThread(null);
        }
      }
    } else {
      toast.error(res.error || "Failed to delete thread");
    }
  };

  // Stop Generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStatusText(null);

    // Update status of last message to stopped
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role === "assistant") {
        return [
          ...prev.slice(0, -1),
          { ...last, status: "stopped" as const },
        ];
      }
      return prev;
    });
  };

  // Handle Citation Click
  const handleCitationClick = (citation: ChatCitation) => {
    if (citation.isDetached || !citation.documentId) {
      toast.info("This source file is no longer available in your workspace.");
      return;
    }

    const doc = documents.find((d) => d.id === citation.documentId);
    if (!doc) {
      toast.info("Document not found in current course.");
      return;
    }

    setPreviewDoc(doc);
    setPreviewCitation(citation);
    setPreviewDialogOpen(true);
  };

  // Send Message & Stream SSE
  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isStreaming) return;

    const userMessage: EnrichedChatMessage = {
      id: `temp-user-${Date.now()}`,
      threadId: activeThreadId || "pending",
      role: "user",
      content: promptText,
      status: "complete",
      model: null,
      citations: null,
      createdAt: new Date(),
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantMessage: EnrichedChatMessage = {
      id: assistantPlaceholderId,
      threadId: activeThreadId || "pending",
      role: "assistant",
      content: "",
      status: "complete",
      model: null,
      citations: null,
      createdAt: new Date(),
    };

    const nextMessages = [...messages, userMessage, assistantMessage];
    setMessages(nextMessages);
    setIsStreaming(true);
    setStatusText("Connecting to StudySync AI Tutor...");
    setTimeout(() => scrollToBottom(true), 20);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`/api/courses/${course.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: promptText,
          threadId: activeThreadId || undefined,
          documentId: selectedDocumentId || undefined,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        const errorData = await response.json();
        toast.warning(
          errorData.error || "Pace limit reached: Max 30 questions per hour. Please wait a bit!"
        );
        // Remove empty assistant placeholder
        setMessages((prev) => prev.filter((m) => m.id !== assistantPlaceholderId));
        setIsStreaming(false);
        setStatusText(null);
        return;
      }

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(errText || "AI Tutor request failed");
      }

      // Check if thread was just created
      const returnedThreadId = response.headers.get("X-Thread-Id");
      if (returnedThreadId && !activeThreadId) {
        setActiveThreadId(returnedThreadId);
        updateUrlThread(returnedThreadId);

        // Add to threads list
        const newThreadItem: ThreadListItem = {
          id: returnedThreadId,
          courseId: course.id,
          title: promptText.slice(0, 40),
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 2,
        };
        setThreads((prev) => [newThreadItem, ...prev]);
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = "";
      let accumulatedContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const events = streamBuffer.split("\n\n");
        streamBuffer = events.pop() || "";

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          let eventType = "message";
          let dataStr = "";

          const lines = rawEvent.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.slice(6).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventType === "status") {
              if (data.stage === "searching") {
                setStatusText("Searching course materials & matching concepts...");
              } else {
                setStatusText(null);
              }
            } else if (eventType === "citations") {
              if (Array.isArray(data.citations)) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, citations: data.citations }
                      : m
                  )
                );
              }
            } else if (eventType === "token") {
              if (data.text) {
                accumulatedContent += data.text;
                setStatusText(null); // Clear search status once tokens arrive
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: accumulatedContent }
                      : m
                  )
                );
                scrollToBottom(true);
              }
            } else if (eventType === "done") {
              if (data.model) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, model: data.model, status: "complete" }
                      : m
                  )
                );
              }
            } else if (eventType === "error") {
              toast.error(data.error || "Streaming error occurred");
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantPlaceholderId
                    ? { ...m, status: "error" }
                    : m
                )
              );
            }
          } catch (jsonErr) {
            console.error("Error parsing SSE event data:", jsonErr, dataStr);
          }
        }
      }

      // Refresh thread titles after short delay (in case auto-title ran)
      if (activeThreadId || returnedThreadId) {
        setTimeout(async () => {
          const tId = activeThreadId || returnedThreadId;
          if (tId) {
            const res = await getThreadMessagesAction(tId);
            if (res.success && res.data?.thread) {
              setThreads((prev) =>
                prev.map((t) =>
                  t.id === tId ? { ...t, title: res.data.thread!.title } : t
                )
              );
            }
          }
        }, 3000);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Chat generation stopped by user.");
      } else {
        console.error("Stream generation error:", err);
        toast.error("Failed to generate response. Please try again.");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? {
                  ...m,
                  content:
                    m.content ||
                    "Sorry, an error occurred while generating this response. Please retry.",
                  status: "error",
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      setStatusText(null);
      abortControllerRef.current = null;
    }
  };

  // Handle Regenerate Last Assistant Message
  const handleRegenerate = async () => {
    if (!activeThreadId || isStreaming) return;

    try {
      const res = await prepareRegenerateAction(activeThreadId);
      if (res.success && res.data?.prompt) {
        // Remove last assistant and user message from local state
        setMessages((prev) => {
          const filtered = prev.filter(
            (_, idx) => idx < prev.length - 2
          );
          return filtered;
        });

        // Trigger resubmission with the prompt
        await handleSendMessage(res.data.prompt);
      } else {
        toast.error(res.error || "Could not prepare regeneration");
      }
    } catch (err) {
      console.error("Failed to regenerate:", err);
      toast.error("Error regenerating response");
    }
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[580px] w-full rounded-2xl border border-border/70 bg-card/30 overflow-hidden shadow-xs">
      {/* 1. Desktop Sidebar */}
      {desktopSidebarOpen && (
        <ThreadSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onNewChat={handleNewChat}
          onRenameThread={handleRenameThread}
          onDeleteThread={handleDeleteThread}
          isCreatingNew={isCreatingNew}
          className="hidden md:flex"
        />
      )}

      {/* 2. Main Chat Conversation Canvas */}
      <div className="flex flex-col flex-1 min-w-0 h-full bg-background/50">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-card/40 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Desktop Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
              className="hidden md:flex size-7 text-muted-foreground hover:text-foreground"
              title={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {desktopSidebarOpen ? (
                <PanelLeftClose className="size-4" />
              ) : (
                <PanelLeftOpen className="size-4" />
              )}
            </Button>

            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden size-7 text-muted-foreground hover:text-foreground"
                >
                  <History className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetHeader className="sr-only">
                  <SheetTitle>Chat Conversations</SheetTitle>
                </SheetHeader>
                <ThreadSidebar
                  threads={threads}
                  activeThreadId={activeThreadId}
                  onSelectThread={handleSelectThread}
                  onNewChat={handleNewChat}
                  onRenameThread={handleRenameThread}
                  onDeleteThread={handleDeleteThread}
                  isCreatingNew={isCreatingNew}
                  className="w-full border-r-0"
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
                {activeThread?.title || "New Chat"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              disabled={isStreaming}
              className="h-7 text-xs px-2.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3 mr-1" />
              <span>New</span>
            </Button>
          </div>
        </div>

        {/* Conversation Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 space-y-4">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Loading conversation history...</span>
            </div>
          ) : messages.length === 0 ? (
            <ChatEmptyState
              courseTitle={course.title}
              courseId={course.id}
              courseSlug={course.slug}
              documents={documents}
              onSelectPrompt={handleSendMessage}
            />
          ) : (
            <>
              {messages.map((msg, index) => {
                const isLastAssistant =
                  msg.role === "assistant" &&
                  index === messages.length - 1 &&
                  !isStreaming;

                return (
                  <MessageBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    status={msg.status}
                    model={msg.model}
                    citations={msg.citations}
                    isLastAssistant={isLastAssistant}
                    onRegenerate={handleRegenerate}
                    onCitationClick={handleCitationClick}
                  />
                );
              })}

              {/* Status Indicator Bar */}
              {statusText && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-xl w-fit animate-pulse border border-border/50">
                  <Search className="size-3.5 text-amber-500 animate-spin" />
                  <span>{statusText}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-4 border-t border-border/60 bg-card/30">
          <ChatInput
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={setSelectedDocumentId}
            onSubmit={handleSendMessage}
            onStop={handleStopGenerating}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      {/* PDF Citation Preview Dialog */}
      {previewDoc && (
        <PdfPreviewDialog
          open={previewDialogOpen}
          onOpenChange={(open) => {
            setPreviewDialogOpen(open);
            if (!open) setPreviewDoc(null);
          }}
          document={previewDoc}
          initialPage={previewCitation?.pageNumber}
        />
      )}
    </div>
  );
}
