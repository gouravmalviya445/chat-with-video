export function buildRagPrompt({
  question,
  context,
}: {
  question: string;
  context: string;
}) {
  return `
You are an AI assistant that answers questions about a video.

Answer the user's question using ONLY the provided video context.

If the answer cannot be found in the provided context, clearly say that the information is not available in the video.

Do not invent facts or information.

Keep the answer clear and concise.

VIDEO CONTEXT:
${context}

USER QUESTION:
${question}
`;
}