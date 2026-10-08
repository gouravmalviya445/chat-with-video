"use client";

import { Video } from "@/lib/api";
import { useVideo } from "@/hooks";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";

interface ProcessingStateProps {
  videoId: string;
  initialVideo: Video;
  onStatusUpdate?: (updatedVideo: Video) => void;
}

export function ProcessingState({ videoId, initialVideo, onStatusUpdate }: ProcessingStateProps) {
  // SWR automatically polls every 3s when status is PENDING or PROCESSING
  const { video } = useVideo(videoId, {
    fallbackData: initialVideo,
    onSuccess: (data) => {
      if (data && data.status !== initialVideo.status) {
        onStatusUpdate?.(data);
      }
    },
  });

  const currentStatus = video?.status || initialVideo.status;

  if (currentStatus === "FAILED") {
    return (
      <div className="sketch-card p-6 bg-red-50 text-center max-w-md mx-auto my-6">
        <div className="w-10 h-10 rounded-full bg-red-100 border-2 border-neutral-900 mx-auto flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="font-handwritten text-xl font-bold text-red-900 mb-1">
          Hmm, we couldn't process this video.
        </h3>
        <p className="text-xs text-red-700">
          The video transcript couldn't be indexed for chat. Please try adding another video.
        </p>
      </div>
    );
  }

  return (
    <div className="sketch-card p-8 bg-paper-card text-center max-w-md mx-auto my-6 relative">
      <div className="w-12 h-12 rounded-xl bg-amber-200 border-2 border-neutral-900 shadow-[2px_2px_0px_#171717] mx-auto flex items-center justify-center mb-4 animate-bounce">
        <Loader2 className="w-6 h-6 text-neutral-900 animate-spin" />
      </div>

      <h3 className="font-handwritten text-2xl font-bold text-neutral-900 mb-2">
        Your video is getting ready
      </h3>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-900 bg-amber-100 text-neutral-900 text-xs font-bold mb-3 shadow-[1px_1px_0px_#171717]">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        <span>○ Processing video transcript... ({currentStatus})</span>
      </div>

      <p className="text-xs text-neutral-600 font-medium">
        You can chat with it once processing is complete. Screen updates automatically.
      </p>

      <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-200">
        <span className="font-handwritten text-xs text-neutral-500 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Chunking transcript & preparing vector embeddings
        </span>
      </div>
    </div>
  );
}
