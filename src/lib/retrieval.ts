// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { pipeline } from "@huggingface/transformers";
import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

export async function embedText(text: string): Promise<number[]> {
  const embed = await getEmbedder();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output: any = await embed(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
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
