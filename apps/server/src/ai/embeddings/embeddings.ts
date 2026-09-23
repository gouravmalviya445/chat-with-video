import { env } from "@/config/env";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const embeddings = new HuggingFaceInferenceEmbeddings({
  model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
  apiKey: env?.HF_API_KEY
})

export { embeddings }