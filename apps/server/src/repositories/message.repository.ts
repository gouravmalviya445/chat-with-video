import db from "@db";
import { messages } from "@db/schema";
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