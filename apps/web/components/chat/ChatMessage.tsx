"use client";

import { Message } from "@/lib/api";
import { SourceCitation } from "./SourceCitation";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Sparkles, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  onSeek?: (seconds: number) => void;
}

export function ChatMessage({ message, onSeek }: ChatMessageProps) {
  const isUser = message.role === "USER";

  if (isUser) {
    return (
      <div className="flex flex-col items-end my-3">
        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-handwritten font-bold text-neutral-600">
          <span>You</span>
          <div className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[9px]">
            <User className="w-2.5 h-2.5" />
          </div>
        </div>

        <div className="sketch-box-sm px-4 py-2.5 bg-paper-card max-w-[85%] sm:max-w-[75%] text-sm font-medium text-ink border-2 border-ink shadow-sketch-sm rounded-tl-xl rounded-bl-xl rounded-tr-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start my-4">
      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-handwritten font-bold text-neutral-700">
        <div className="w-4 h-4 rounded-full bg-amber-300 border border-neutral-900 flex items-center justify-center text-[9px]">
          <Sparkles className="w-2.5 h-2.5 text-neutral-900" />
        </div>
        <span>Video AI Assistant</span>
      </div>

      <div className="max-w-[95%] sm:max-w-[88%] text-sm text-neutral-900 leading-relaxed pl-2 border-l-2 border-neutral-900 py-1">
        <MarkdownRenderer content={message.content} />

        {/* Source Citations if any */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-dashed border-neutral-300">
            <span className="font-handwritten text-xs font-bold text-neutral-700 block mb-1.5">
              Sources from video clip:
            </span>
            <div className="flex flex-col gap-2">
              {message.sources.map((src, idx) => (
                <SourceCitation key={src.id || idx} source={src} onSeek={onSeek} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
