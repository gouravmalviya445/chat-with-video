"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AddVideoDialog } from "@/components/video/AddVideoDialog";
import { VideoGrid } from "@/components/video/VideoGrid";
import { EmptyState, Button } from "@/components/ui";
import { useVideos } from "@/hooks";
import { useUiStore } from "@/store";
import { deleteVideo } from "@/lib/api";
import { Upload, Plus, Loader2, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default function VideosPage() {
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;
  const { videos, isLoading, isError, error, mutateVideos } = useVideos(PAGE_SIZE, offset);
  const { openAddVideoModal } = useUiStore();

  const handleDeleteVideo = async (videoId: string) => {
    try {
      // Optimistic update
      await mutateVideos(
        videos.filter((v) => v.id !== videoId),
        false
      );
      await deleteVideo(videoId);
      await mutateVideos();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete video");
      await mutateVideos();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b-2 border-dashed border-neutral-300 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-900 bg-amber-100 text-neutral-800 text-xs font-bold mb-2 shadow-[1px_1px_0px_#171717]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Your Video Library
            </div>
            <h1 className="font-handwritten text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Your <span className="marker-highlight">videos</span>
            </h1>
            <p className="text-sm text-neutral-600 mt-2 font-medium">
              Pick a video and start asking questions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => openAddVideoModal("youtube")}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4 text-ink" />}
            >
              Add YouTube video
            </Button>

            <Button
              onClick={() => openAddVideoModal("upload")}
              variant="secondary"
              size="sm"
              leftIcon={<Upload className="w-4 h-4 text-blue-600" />}
            >
              Upload video
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-neutral-900 rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#171717]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700 font-medium">
                {error?.message || "Failed to load videos."}
              </p>
            </div>
            <Button
              onClick={() => mutateVideos()}
              variant="secondary"
              size="sm"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Content State */}
        {isLoading ? (
          <div className="sketch-box p-12 text-center my-8 bg-paper-card">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mx-auto mb-3" />
            <p className="font-handwritten text-xl font-bold text-neutral-800">
              Fetching your videos...
            </p>
          </div>
        ) : videos.length === 0 && page === 0 ? (
          <EmptyState onAddClick={() => openAddVideoModal("youtube")} />
        ) : videos.length === 0 ? (
          <div className="sketch-box p-8 text-center bg-paper-card">
            <p className="font-handwritten text-xl font-bold text-neutral-800">No videos on this page.</p>
          </div>
        ) : (
          <VideoGrid videos={videos} onDelete={handleDeleteVideo} />
        )}

        {!isLoading && !isError && (page > 0 || videos.length === PAGE_SIZE) && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <span className="text-sm font-semibold text-neutral-700">Page {page + 1}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={videos.length < PAGE_SIZE || offset >= 100}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      {/* Add Video Modal Dialog */}
      <AddVideoDialog onSuccess={() => mutateVideos()} />
    </div>
  );
}
