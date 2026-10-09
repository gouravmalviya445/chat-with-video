"use client";

import { useEffect, useRef, useState } from "react";
import { Message, Conversation, getConversationMessages, createConversation, getVideoConversations, API_PREFIX } from "@/lib/api";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Sparkles, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui";

interface ChatWindowProps {
  videoId: string;
  onSeek?: (seconds: number) => void;
}

export function ChatWindow({ videoId, onSeek }: ChatWindowProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConv, setIsLoadingConv] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Load or create conversation for this video
  useEffect(() => {
    let isMounted = true;
    async function initConversation() {
      try {
        setIsLoadingConv(true);
        setError(null);

        // Fetch existing conversations for video
        const convs = await getVideoConversations(videoId);
        let activeConv: Conversation;

        if (convs && convs.length > 0) {
          activeConv = convs[0];
        } else {
          // Create a new conversation for this video
          activeConv = await createConversation(videoId, "Video Chat");
        }

        if (isMounted) {
          setConversation(activeConv);
          // Load messages
          const msgs = await getConversationMessages(activeConv.id);
          setMessages(msgs || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load chat conversation.");
        }
      } finally {
        if (isMounted) setIsLoadingConv(false);
      }
    }

    initConversation();
    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleSendMessage = async (userText: string) => {
    if (!conversation || isStreaming) return;

    setError(null);
    const tempUserMsg: Message = {
      id: "temp-user-" + Date.now(),
      conversationId: conversation.id,
      role: "USER",
      content: userText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch(`${API_PREFIX}/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: userText }),
      });

      if (!res.ok) {
        throw new Error(`Failed to send message (${res.status})`);
      }

      if (!res.body) {
        throw new Error("No response body received from server");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Clean up UI message stream prefixes if present (e.g. 0:"text")
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const parsed = JSON.parse(line.slice(2));
              accumulated += parsed;
            } catch {
              accumulated += line.slice(2);
            }
          } else if (line.trim().length > 0 && !line.startsWith("e:") && !line.startsWith("d:")) {
            // Raw text chunk
            accumulated += line;
          }
        }
        setStreamingText(accumulated);
      }

      // After streaming completes, re-fetch messages from DB to get full sources metadata
      const updatedMsgs = await getConversationMessages(conversation.id);
      setMessages(updatedMsgs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong while answering. Try again.");
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  };

  const exampleQuestions = [
    "What is the main idea of this video?",
    "Explain the key concepts mentioned.",
    "Give me a bullet-point summary.",
  ];

  if (isLoadingConv) {
    return (
      <div className="sketch-box p-8 text-center bg-paper-card my-4">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-900 mx-auto mb-2" />
        <p className="font-handwritten text-lg text-neutral-800">
          Opening notebook chat...
        </p>
      </div>
    );
  }

  return (
    <div className="sketch-card p-4 bg-paper-card flex flex-col h-145 relative">
      {/* Header */}
      <div className="pb-3 mb-2 border-b-2 border-dashed border-neutral-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-handwritten text-xl font-bold text-neutral-900">
            Video Notebook Chat
          </span>
          <span className="text-[10px] font-bold bg-yellow-200 text-neutral-900 px-2 py-0.5 rounded border border-neutral-900">
            RAG Active
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-2 p-2.5 bg-red-50 border-2 border-neutral-900 rounded-lg flex items-center gap-2 text-xs text-red-700 shadow-[2px_2px_0px_#171717]">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 pr-2 space-y-3">
        {messages.length === 0 && !isStreaming ? (
          /* Empty Chat State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="text-3xl mb-2 select-none animate-bounce">✦</div>
            <h3 className="font-handwritten text-2xl font-bold text-neutral-900 mb-1">
              Ask your video anything.
            </h3>
            <p className="text-xs text-neutral-600 mb-4 max-w-xs">
              Type a question below or pick a suggested topic to begin:
            </p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              {exampleQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSendMessage(q)}
                  className="text-left justify-start hover:bg-yellow-100/60 font-medium"
                >
                  "{q}"
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onSeek={onSeek} />
            ))}

            {/* Live Streaming Indicator & Text */}
            {isStreaming && (
              <div className="flex flex-col items-start my-3">
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-handwritten font-bold text-neutral-700">
                  <div className="w-4 h-4 rounded-full bg-amber-300 border border-neutral-900 flex items-center justify-center text-[9px]">
                    <Sparkles className="w-2.5 h-2.5 text-neutral-900 animate-spin" />
                  </div>
                  <span className="animate-pulse">thinking & writing...</span>
                </div>

                <div className="max-w-[88%] text-sm text-neutral-900 leading-relaxed pl-2 border-l-2 border-neutral-900 py-1 bg-amber-50/50 rounded-r-lg">
                  {streamingText ? (
                    <MarkdownRenderer content={streamingText} />
                  ) : (
                    <p className="italic text-neutral-500 font-handwritten">
                      Searching video timestamps & writing answer...
                    </p>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form at Bottom */}
      <div className="pt-3 border-t-2 border-dashed border-neutral-300 mt-2">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={!conversation}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
