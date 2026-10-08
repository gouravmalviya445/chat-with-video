"use client";

import { Video } from "@/lib/api";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  onDelete?: (videoId: string) => void;
}

export function VideoGrid({ videos, onDelete }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onDelete={onDelete} />
      ))}
    </div>
  );
}
