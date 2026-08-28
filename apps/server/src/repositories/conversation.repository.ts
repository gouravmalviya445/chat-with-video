import db from "@/db";
import { conversations } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

/**
 * Creates a new conversation entry in the database.
 * 
 * @param userId - ID of the user creating the conversation
 * @param videoId - ID of the video for which conversation is created
 * @param title - title of the conversation (default: "New Conversation")
 * @returns conversation object
 */
export async function createConversation({
  userId,
  videoId,
  title = "New Conversation",
}: {
  userId: string;
  videoId: string;
  title?: string;
}) {
  const [conversation] = await db
    .insert(conversations)
    .values({
      userId,
      videoId,
      title
    })
    .returning();

  return conversation;
}


/**
 * Finds a conversation by its ID and user ID.
 * 
 * @param conversationId - ID of the conversation to find
 * @param userId - ID of the user to find the conversation for
 * @returns conversation object
 */
export async function findConversationById(
  conversationId: string,
  userId: string,
) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId),
      ),
    )
    .limit(1);

  return conversation;
}

/**
 * gets all conversations for a video that belongs to the user
 * 
 * @param videoId - ID of the video to get conversations for
 * @param userId - ID of the user to get conversations for
 * @returns conversation objects
 */
export async function getConversationsByVideoId(
  videoId: string,
  userId: string,
) {
  return await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.videoId, videoId),
        eq(conversations.userId, userId),
      ),
    )
    .orderBy(desc(conversations.createdAt));
}

/**
 * deletes conversation that belongs to the user
 * 
 * @param conversationId - ID of the conversation to delete
 * @param userId - ID of the user to delete the conversation for
 * @returns conversation object
 */
export async function deleteConversation(
  conversationId: string,
  userId: string,
) {
  const [conversation] = await db
    .delete(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId),
      ),
    )
    .returning();

  return conversation;
}