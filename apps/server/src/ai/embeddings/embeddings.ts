import { env } from "@/config/env";
import { EMBEDDING_MODEL, VECTOR_DIMENSIONS } from "@/constants";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: EMBEDDING_MODEL,
  outputDimensionality: VECTOR_DIMENSIONS,
  apiKey: env?.GOOGLE_GENERATIVE_AI_API_KEY
});

export { embeddings }