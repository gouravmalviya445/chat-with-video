import { env } from "@/config/env";

export type VideoStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";
export type VideoSource = "YOUTUBE" | "UPLOAD";

export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  source: VideoSource;
  youtubeUrl?: string | null;
  storageUrl?: string | null;
  duration?: number | null;
  status: VideoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  videoId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageSource {
  id: string;
  videoChunkId?: string;
  content: string;
  startTime: number;
  endTime: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  sources?: MessageSource[];
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

// Clean API prefix handling to avoid double /api
export const API_PREFIX = env.NEXT_PUBLIC_API_URL.endsWith("/api")
  ? env.NEXT_PUBLIC_API_URL
  : `${env.NEXT_PUBLIC_API_URL}/api`;


/**
 * Handles the response from an API call.
 * @param res The response from the API call.
 * @returns The data from the response.
 * @throws Error if the response is not OK.
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

/**
 * Fetch all user videos
 */
export async function getVideos(): Promise<Video[]> {
  const res = await fetch(`${API_PREFIX}/videos`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse<Video[]>(res);
}

/**
 * Fetch single video details by ID
 */
export async function getVideo(id: string): Promise<Video> {
  const res = await fetch(`${API_PREFIX}/videos/${id}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse<Video>(res);
}

/**
 * Add a YouTube video
 */
export async function createYouTubeVideo(title: string, youtubeUrl: string): Promise<{ id: string; status: VideoStatus }> {
  const res = await fetch(`${API_PREFIX}/videos/youtube`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title, youtubeUrl }),
  });
  return handleResponse<{ id: string; status: VideoStatus }>(res);
}

/**
 * Step 1: Initialize upload to get storage upload parameters
 */
export async function createVideoUpload(title: string): Promise<{ videoId: string; path: string; token: string }> {
  const res = await fetch(`${API_PREFIX}/videos/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });
  return handleResponse<{ videoId: string; path: string; token: string }>(res);
}

/**
 * Step 2: Upload file binary directly using the upload credentials
 */
export async function uploadFileToSupabase(path: string, token: string, file: File): Promise<void> {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const uploadEndpoint = `${supabaseUrl}/storage/v1/object/upload/sign/${path}?token=${token}`;

  const res = await fetch(uploadEndpoint, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "video/mp4",
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Direct video upload failed: ${text || res.statusText}`);
  }
}

/**
 * Step 3: Complete upload and notify backend to enqueue ingestion job
 */
export async function completeVideoUpload(videoId: string): Promise<{ id: string; status: VideoStatus }> {
  const res = await fetch(`${API_PREFIX}/videos/${videoId}/upload-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse<{ id: string; status: VideoStatus }>(res);
}

/**
 * Delete a video
 */
export async function deleteVideo(videoId: string): Promise<void> {
  const res = await fetch(`${API_PREFIX}/videos/${videoId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  await handleResponse<null>(res);
}

/**
 * Get conversations for a specific video
 */
export async function getVideoConversations(videoId: string): Promise<Conversation[]> {
  const res = await fetch(`${API_PREFIX}/videos/${videoId}/conversations`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse<Conversation[]>(res);
}

/**
 * Create a conversation for a video
 */
export async function createConversation(videoId: string, title: string = "New Chat"): Promise<Conversation> {
  const res = await fetch(`${API_PREFIX}/videos/${videoId}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });
  return handleResponse<Conversation>(res);
}

/**
 * Get messages of a conversation
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`${API_PREFIX}/conversations/${conversationId}/messages`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse<Message[]>(res);
}
