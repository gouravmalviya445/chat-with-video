"use client";

import { Plus } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  onAddClick: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="sketch-box p-8 sm:p-12 text-center max-w-md mx-auto my-8 bg-paper-card relative">
      {/* Hand-drawn style pencil/doodle icon */}
      <div className="text-5xl mb-3 animate-doodle inline-block select-none">
        ✎
      </div>

      <h3 className="font-handwritten text-2xl font-bold text-neutral-900 mb-2">
        No videos yet.
      </h3>

      <p className="text-sm text-neutral-600 mb-6 max-w-xs mx-auto">
        Add your first video and start asking questions right away.
      </p>

      <Button
        onClick={onAddClick}
        variant="primary"
        size="lg"
        leftIcon={<Plus className="w-4 h-4 text-ink" />}
      >
        Add a video
      </Button>

      {/* Handwritten note */}
      <div className="mt-6 text-center">
        <span className="font-handwritten text-xs text-neutral-500">
          💡 YouTube link or video file supported!
        </span>
      </div>
    </div>
  );
}
