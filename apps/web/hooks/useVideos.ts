import useSWR, { SWRConfiguration } from "swr";
import {
  getVideos,
  getVideo,
  Video,
  API_PREFIX,
} from "@/lib/api";

/**
 * SWR Hook to fetch all user videos with automatic caching and revalidation
 */
export function useVideos(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<Video[]>(
    `${API_PREFIX}/videos`,
    () => getVideos(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      ...config,
    }
  );

  return {
    videos: data || [],
    isLoading,
    isError: error,
    error,
    mutateVideos: mutate,
  };
}

/**
 * SWR Hook to fetch a single video by ID.
 * Automatically polls status every 3s if status is PENDING or PROCESSING.
 */
export function useVideo(videoId: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<Video>(
    videoId ? `${API_PREFIX}/videos/${videoId}` : null,
    () => getVideo(videoId!),
    {
      refreshInterval: (video) =>
        video?.status === "PENDING" || video?.status === "PROCESSING" ? 3000 : 0,
      revalidateOnFocus: true,
      ...config,
    }
  );

  return {
    video: data || null,
    isLoading,
    isError: error,
    error,
    mutateVideo: mutate,
  };
}
