import { InferenceClient } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

export async function embedText(text: string): Promise<number[]> {
  const output = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });
  // output is number[] for a single input
  return output as number[];
}

export async function retrieveContext(query: string, topK = 5): Promise<string> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const queryEmbedding = await embedText(query);

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: queryEmbedding,
    match_count: topK,
  });

  if (error) {
    console.error("Retrieval error:", error.message);
    return "";
  }

  return (data as { text: string }[]).map((row) => row.text).join("\n\n");
}
