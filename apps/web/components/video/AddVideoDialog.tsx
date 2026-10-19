"use client";

import { useState } from "react";
import { createYouTubeVideo, createVideoUpload, uploadFileToSupabase, completeVideoUpload } from "@/lib/api";
import { useUiStore } from "@/store";
import { youtubeVideoSchema, uploadVideoSchema } from "@/validators";
import { Upload, X, Link as LinkIcon, AlertCircle, Loader2, FileVideo } from "lucide-react";
import { Button } from "@/components/ui";

function YouTubeIcon({ className = "w-4 h-4 text-red-600" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface AddVideoDialogProps {
  onSuccess?: () => void;
}

export function AddVideoDialog({ onSuccess }: AddVideoDialogProps) {
  const { isAddVideoOpen, closeAddVideoModal, addVideoTab } = useUiStore();
  const [tab, setTab] = useState<"youtube" | "upload">(addVideoTab || "youtube");

  const [ytTitle, setYtTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");

  const [uploadTitle, setUploadTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);

  if (!isAddVideoOpen) return null;

  const handleClose = () => {
    setError(null);
    setFieldErrors({});
    closeAddVideoModal();
  };

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = youtubeVideoSchema.safeParse({
      title: ytTitle,
      youtubeUrl: ytUrl,
    });

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await createYouTubeVideo(result.data.title, result.data.youtubeUrl);
      setYtTitle("");
      setYtUrl("");
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add YouTube video.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = uploadVideoSchema.safeParse({ title: uploadTitle });
    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    if (!file) {
      setError("Please select a video file to upload.");
      return;
    }

    setIsLoading(true);
    setUploadPercent(0);
    try {
      setUploadProgress("Initializing video upload...");
      const { videoId, path, token } = await createVideoUpload(result.data.title);

      setUploadProgress("Uploading file (0%)...");
      await uploadFileToSupabase(path, token, file, (percent) => {
        setUploadPercent(percent);
        setUploadProgress(`Uploading file (${percent}%)...`);
      });

      setUploadProgress("Completing setup...");
      setUploadPercent(100);
      await completeVideoUpload(videoId);

      setUploadTitle("");
      setFile(null);
      setUploadProgress("");
      setUploadPercent(null);
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload video.");
      setUploadPercent(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="sketch-card w-full max-w-lg bg-paper-card p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-900"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </Button>

        <h2 className="font-handwritten text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <span>Add New Video</span>
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b-2 border-dashed border-neutral-300 pb-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setTab("youtube");
              setError(null);
              setFieldErrors({});
            }}
            leftIcon={<YouTubeIcon className="w-4 h-4 text-red-600" />}
            className={
              tab === "youtube"
                ? "bg-amber-200 border-neutral-900 font-bold"
                : "bg-white text-neutral-600"
            }
          >
            YouTube Video
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setTab("upload");
              setError(null);
              setFieldErrors({});
            }}
            leftIcon={<Upload className="w-4 h-4 text-blue-600" />}
            className={
              tab === "upload"
                ? "bg-amber-200 border-neutral-900 font-bold"
                : "bg-white text-neutral-600"
            }
          >
            Upload File
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-neutral-900 rounded-lg flex items-start gap-2.5 shadow-[2px_2px_0px_#171717]">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        {tab === "youtube" ? (
          <form onSubmit={handleYouTubeSubmit} className="space-y-4">
            <div>
              <label className="block font-handwritten text-sm font-bold text-neutral-800 mb-1">
                Video Title <span className="text-neutral-500">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Understanding React Server Components"
                value={ytTitle}
                onChange={(e) => setYtTitle(e.target.value)}
                className={`sketch-input w-full text-sm ${
                  fieldErrors.title ? "border-red-600 bg-red-50/50" : ""
                }`}
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-red-600 font-medium mt-1 font-handwritten">
                  ⚠️ {fieldErrors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block font-handwritten text-sm font-bold text-neutral-800 mb-1">
                YouTube URL
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  className={`sketch-input w-full pl-9 text-sm ${
                    fieldErrors.youtubeUrl ? "border-red-600 bg-red-50/50" : ""
                  }`}
                />
              </div>
              {fieldErrors.youtubeUrl && (
                <p className="text-[11px] text-red-600 font-medium mt-1 font-handwritten">
                  ⚠️ {fieldErrors.youtubeUrl}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Add Video
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block font-handwritten text-sm font-bold text-neutral-800 mb-1">
                Video Title
              </label>
              <input
                type="text"
                placeholder="e.g. Project Demo Walkthrough"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className={`sketch-input w-full text-sm ${
                  fieldErrors.title ? "border-red-600 bg-red-50/50" : ""
                }`}
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-red-600 font-medium mt-1 font-handwritten">
                  ⚠️ {fieldErrors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block font-handwritten text-sm font-bold text-neutral-800 mb-1">
                Video File (MP4, MOV, WebM)
              </label>
              <div className="border-2 border-dashed border-neutral-900 rounded-xl bg-amber-50/50 p-6 text-center hover:bg-amber-100/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      if (!uploadTitle) {
                        setUploadTitle(f.name.replace(/\.[^/.]+$/, ""));
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-2 text-neutral-900">
                    <FileVideo className="w-6 h-6 text-amber-600" />
                    <div className="text-left truncate">
                      <p className="font-bold text-xs truncate max-w-60">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-full bg-amber-200 border-2 border-neutral-900 shadow-[2px_2px_0px_#171717] mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5 text-neutral-900" />
                    </div>
                    <p className="font-handwritten text-base font-bold text-neutral-900">
                      Drop your video here
                    </p>
                    <p className="text-xs text-neutral-500">or click to browse your files</p>
                  </div>
                )}
              </div>
            </div>

            {uploadProgress && (
              <div className="p-3 bg-amber-50 border-2 border-neutral-900 rounded-lg text-xs font-semibold text-neutral-800 space-y-2 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-900 shrink-0" />
                    <span className="font-handwritten text-sm text-neutral-900 font-bold">{uploadProgress}</span>
                  </div>
                  {uploadPercent !== null && (
                    <span className="font-mono text-xs font-bold text-neutral-900">{uploadPercent}%</span>
                  )}
                </div>
                {uploadPercent !== null && (
                  <div className="w-full bg-white h-2.5 rounded-full border border-neutral-900 overflow-hidden relative">
                    <div
                      className="bg-marker-yellow h-full transition-all duration-150 border-r border-neutral-900"
                      style={{ width: `${uploadPercent}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isLoading}
                disabled={isLoading || !file}
                leftIcon={<Upload className="w-4 h-4 text-ink" />}
              >
                Upload & Start RAG
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
