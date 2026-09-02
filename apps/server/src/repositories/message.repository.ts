import db from "@db";
import { messages, messageSources } from "@db/schema";
import { asc, eq } from "drizzle-orm";


/**
 * Creates a new message in the database.
 * 
 * @param conversationId - ID of the conversation
 * @param role - role of the sender USER/ASSISTANT
 * @param content - content of the message
 * @returns created message
 */
export async function createMessage({
  conversationId,
  role,
  content,
}: {
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
}) {
  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      role,
      content,
    })
    .returning();

  return message;
}


/**
 * Retrieves all messages for specific conversation, ordered by creation time
 * 
 * @param conversationId - ID of the conversation
 * @returns array of messages in the conversation
 */
export async function getConversationMessages(
  conversationId: string,
) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

/**
 * Retrieves all messages for specific conversation, ordered by creation time
 * 
 * @param conversationId - ID of the conversation
 * @returns array of messages in the conversation
 */
export async function findMessagesByConversationId(
  conversationId: string,
) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

/**
 * Creates an assistant message with associated message sources.
 * 
 * @param conversationId - ID of the conversation
 * @param content - content of the message
 * @param videoChunkIds - IDs of the video chunks
 * @returns created message with message sources
 */
export async function createAssistantMessageWithSources({
  conversationId,
  content,
  videoChunkIds,
}: {
  conversationId: string;
  content: string;
  videoChunkIds: string[];
}) {
  return db.transaction(async (tx) => {
    const [message] = await tx
      .insert(messages)
      .values({
        conversationId,
        role: "ASSISTANT",
        content,
      })
      .returning();

    if (videoChunkIds.length > 0 && message) {
      await tx.insert(messageSources).values(
        videoChunkIds.map((videoChunkId) => ({
          messageId: message.id,
          videoChunkId,
        })),
      );
    }

    return message;
  });
}