"use client";

import { useEffect, useRef, useState } from "react";
import { Video } from "@/lib/api";
import { Play, Video as VideoIcon } from "lucide-react";

function YouTubeIcon({ className = "w-3 h-3 text-red-600" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}


interface VideoPlayerProps {
  video: Video;
  seekTime?: number | null;
}

export function VideoPlayer({ video, seekTime }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSeekTime, setCurrentSeekTime] = useState<number | null>(null);

  // Extract YouTube ID
  const getYouTubeId = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const ytId = video.source === "YOUTUBE" ? getYouTubeId(video.youtubeUrl) : null;

  useEffect(() => {
    if (seekTime === null || seekTime === undefined) return;
    setCurrentSeekTime(seekTime);

    if (video.source === "UPLOAD" && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      videoRef.current.play().catch(() => {});
    }
  }, [seekTime, video.source]);

  // Construct YouTube Embed URL with current seek time
  const getEmbedUrl = () => {
    if (!ytId) return "";
    let url = `https://www.youtube.com/embed/${ytId}?enablejsapi=1`;
    if (currentSeekTime !== null) {
      url += `&start=${Math.floor(currentSeekTime)}&autoplay=1`;
    }
    return url;
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Hand-drawn player frame */}
      <div className="sketch-card p-2 bg-paper-card relative group">
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-neutral-900 border-2 border-neutral-900 relative shadow-inner flex items-center justify-center">
          {video.source === "YOUTUBE" && ytId ? (
            <iframe
              ref={iframeRef}
              src={getEmbedUrl()}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : video.storageUrl ? (
            <video
              ref={videoRef}
              src={video.storageUrl}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-6 text-neutral-400">
              <VideoIcon className="w-12 h-12 mx-auto mb-2 text-neutral-600 animate-pulse" />
              <p className="font-handwritten text-lg text-neutral-200">
                Video source player loading...
              </p>
            </div>
          )}
        </div>

        {/* Small Annotation */}
        <div className="absolute -bottom-3 left-4 bg-amber-200 border-2 border-neutral-900 px-2.5 py-0.5 rounded text-[11px] font-handwritten font-bold text-neutral-900 shadow-[1px_1px_0px_#171717] -rotate-1">
          ← watch & ask
        </div>
      </div>

      {/* Video Details */}
      <div className="pt-2 px-1">
        <div className="flex items-center gap-2 mb-1">
          {video.source === "YOUTUBE" ? (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              <YouTubeIcon className="w-3 h-3" /> YouTube Video
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              <Play className="w-3 h-3" /> Uploaded File
            </span>
          )}
        </div>

        <h2 className="font-handwritten text-2xl font-bold text-neutral-900 leading-tight">
          {video.title}
        </h2>
      </div>
    </div>
  );
}
