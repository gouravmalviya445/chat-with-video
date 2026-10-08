import useSWR, { SWRConfiguration } from "swr";
import {
  getVideoConversations,
  getConversationMessages,
  Conversation,
  Message,
  API_PREFIX,
} from "@/lib/api";

/**
 * SWR Hook to fetch conversations for a video
 */
export function useVideoConversations(videoId: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<Conversation[]>(
    videoId ? `${API_PREFIX}/videos/${videoId}/conversations` : null,
    () => getVideoConversations(videoId!),
    {
      revalidateOnFocus: false,
      ...config,
    }
  );

  return {
    conversations: data || [],
    isLoading,
    isError: error,
    error,
    mutateConversations: mutate,
  };
}

/**
 * SWR Hook to fetch messages for a conversation
 */
export function useConversationMessages(conversationId: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<Message[]>(
    conversationId ? `${API_PREFIX}/conversations/${conversationId}/messages` : null,
    () => getConversationMessages(conversationId!),
    {
      revalidateOnFocus: false,
      ...config,
    }
  );

  return {
    messages: data || [],
    isLoading,
    isError: error,
    error,
    mutateMessages: mutate,
  };
}
