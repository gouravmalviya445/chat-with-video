"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { VideoPlayer } from "@/components/chat/VideoPlayer";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ProcessingState } from "@/components/video/ProcessingState";
import { getVideo, Video } from "@/lib/api";
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui";

type VideoSize = "small" | "medium" | "large";

interface VideoChatPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export default function VideoChatPage({ params }: VideoChatPageProps) {
  const resolvedParams = use(params);
  const videoId = resolvedParams.videoId;

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [videoSize, setVideoSize] = useState<VideoSize>("medium");

  const fetchVideoDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getVideo(videoId);
      setVideo(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load video details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoDetails();
  }, [videoId]);

  const handleSeek = (seconds: number) => {
    // If hidden, auto-reveal video so the user can watch the referenced timestamp
    if (!isVideoVisible) {
      setIsVideoVisible(true);
    }
    setSeekTime(seconds);
  };

  const videoSpanClass = {
    small: "lg:col-span-5 xl:col-span-4",
    medium: "lg:col-span-6 xl:col-span-7",
    large: "lg:col-span-8 xl:col-span-8",
  }[videoSize];

  const chatSpanClass = {
    small: "lg:col-span-7 xl:col-span-8",
    medium: "lg:col-span-6 xl:col-span-5",
    large: "lg:col-span-4 xl:col-span-4",
  }[videoSize];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* Navigation & Controls Bar */}
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/videos"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-900" />
            <span>Back to videos</span>
          </Link>

          {video && video.status === "READY" && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Video Box Size Selector */}
              {isVideoVisible && (
                <div className="flex items-center sketch-box-sm bg-paper-card p-0.5 gap-0.5">
                  <span className="text-[11px] font-handwritten font-bold px-2 text-neutral-600 hidden sm:inline">
                    Video size:
                  </span>
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setVideoSize(size)}
                      className={`px-2.5 py-1 text-xs rounded transition-all font-semibold capitalize cursor-pointer ${
                        videoSize === size
                          ? "bg-marker-yellow text-ink border border-ink shadow-xs font-bold"
                          : "text-neutral-600 hover:text-ink hover:bg-neutral-100"
                      }`}
                      title={`Set video box size to ${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

              {/* Hide / Show Video Toggle Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsVideoVisible((prev) => !prev)}
                leftIcon={
                  isVideoVisible ? (
                    <EyeOff className="w-3.5 h-3.5 text-neutral-700" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-neutral-700" />
                  )
                }
                title={isVideoVisible ? "Hide video to focus on chat" : "Show video player"}
              >
                {isVideoVisible ? "Hide Video" : "Show Video"}
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="sketch-box p-12 text-center my-8 bg-paper-card">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mx-auto mb-3" />
            <p className="font-handwritten text-xl font-bold text-neutral-800">
              Opening video notebook...
            </p>
          </div>
        ) : error || !video ? (
          /* Error State */
          <div className="sketch-card p-8 bg-red-50 text-center max-w-md mx-auto my-8">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-handwritten text-2xl font-bold text-red-900 mb-2">
              Video not found
            </h3>
            <p className="text-xs text-red-700 mb-4">
              {error || "We couldn't retrieve the requested video."}
            </p>
            <Link
              href="/videos"
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              Return to Video Library
            </Link>
          </div>
        ) : video.status !== "READY" ? (
          /* Processing State Banner */
          <ProcessingState
            videoId={video.id}
            initialVideo={video}
            onStatusUpdate={(updated) => setVideo(updated)}
          />
        ) : (
          /* Main Responsive Layout */
          <div
            className={
              isVideoVisible
                ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all duration-200"
                : "max-w-3xl mx-auto w-full transition-all duration-200"
            }
          >
            {/* Left Column: Video Player & Info (Hidden when user toggles video off) */}
            {isVideoVisible && (
              <div
                className={`${videoSpanClass} flex flex-col gap-4 animate-in fade-in duration-200 transition-all`}
              >
                <VideoPlayer video={video} seekTime={seekTime} />
              </div>
            )}

            {/* Right Column: Chat Window (Expands when video is small or hidden) */}
            <div
              className={
                isVideoVisible
                  ? `${chatSpanClass} transition-all`
                  : "w-full transition-all"
              }
            >
              <ChatWindow videoId={video.id} onSeek={handleSeek} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
