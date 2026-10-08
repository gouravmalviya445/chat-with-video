"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { chatMessageSchema } from "@/validators";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export function ChatInput({ onSendMessage, disabled, isStreaming }: ChatInputProps) {
  const [content, setContent] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setValidationError(null);

    const result = chatMessageSchema.safeParse({ content });
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message || "Message cannot be empty");
      return;
    }

    if (disabled || isStreaming) return;

    onSendMessage(result.data.content.trim());
    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div className="sketch-box bg-paper-card p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-amber-300">
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (validationError) setValidationError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask something about this video... (Enter to send)"
          disabled={disabled || isStreaming}
          className="w-full bg-transparent px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none resize-none min-h-[38px] max-h-[120px]"
        />

        <Button
          type="submit"
          variant="primary"
          size="icon"
          isLoading={isStreaming}
          disabled={!content.trim() || disabled || isStreaming}
          className="w-9 h-9 p-0 shrink-0 text-ink"
          title="Send message"
        >
          <Send className="w-4 h-4 text-ink" />
        </Button>
      </div>

      {validationError && (
        <p className="text-[11px] text-red-600 font-medium px-2 mt-1 font-handwritten">
          ⚠️ {validationError}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between px-2 text-[10px] text-neutral-500 font-handwritten">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span>Smart Video Search</span>
      </div>
    </form>
  );
}
