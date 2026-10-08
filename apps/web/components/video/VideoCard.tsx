"use client";

import Link from "next/link";
import { Video } from "@/lib/api";
import { Upload, Clock, CheckCircle2, AlertTriangle, Loader2, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";

function YouTubeIcon({ className = "w-3 h-3 text-red-600" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

import { useState } from "react";

interface VideoCardProps {
  video: Video;
  onDelete?: (videoId: string) => void;
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = () => {
    switch (video.status) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border border-neutral-900 bg-emerald-100 text-emerald-900 shadow-[1px_1px_0px_#171717]">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Ready
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border border-neutral-900 bg-amber-200 text-neutral-900 shadow-[1px_1px_0px_#171717]">
            <Loader2 className="w-3 h-3 animate-spin text-neutral-900" />
            Processing...
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border border-neutral-900 bg-sky-100 text-sky-900 shadow-[1px_1px_0px_#171717]">
            <Clock className="w-3 h-3 text-sky-700" />
            Waiting
          </span>
        );
      case "FAILED":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border border-neutral-900 bg-red-100 text-red-900 shadow-[1px_1px_0px_#171717]">
            <AlertTriangle className="w-3 h-3 text-red-700" />
            Failed
          </span>
        );
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this video?")) {
      setIsDeleting(true);
      try {
        if (onDelete) await onDelete(video.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="sketch-card p-5 bg-paper-card flex flex-col justify-between h-full relative group">
      <div>
        {/* Source Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
            {video.source === "YOUTUBE" ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-900 bg-red-100 text-red-900 text-[11px] shadow-[1px_1px_0px_#171717]">
                <YouTubeIcon className="w-3 h-3 text-red-600" />
                YouTube
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-900 bg-blue-100 text-blue-900 text-[11px] shadow-[1px_1px_0px_#171717]">
                <Upload className="w-3 h-3 text-blue-600" />
                Uploaded
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                isLoading={isDeleting}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 w-7 h-7"
                title="Delete video"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Video Title */}
        <h3 className="font-handwritten text-xl font-bold text-neutral-900 line-clamp-2 leading-tight mb-2">
          {video.title}
        </h3>
      </div>

      {/* Footer & Action */}
      <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-200 flex items-center justify-between">
        <span className="text-[11px] font-mono text-neutral-500">
          {new Date(video.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>

        {video.status === "READY" ? (
          <Link
            href={`/videos/${video.id}/chat`}
            className="sketch-button-primary px-3.5 py-1.5 text-xs gap-1.5"
          >
            <span>Chat</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-900" />
          </Link>
        ) : (
          <Link
            href={`/videos/${video.id}/chat`}
            className="sketch-button px-3 py-1.5 text-xs text-neutral-600 gap-1 bg-amber-50/50"
          >
            <span>View Status</span>
          </Link>
        )}
      </div>
    </div>
  );
}
