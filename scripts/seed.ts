import "dotenv/config";
import { pipeline } from "@huggingface/transformers";
import { createClient } from "@supabase/supabase-js";
import { CHUNKS } from "../src/lib/chunks";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log("Loading embedding model (downloads once, ~25MB)...");
  const embed = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("Model loaded.\n");

  console.log(`Embedding ${CHUNKS.length} chunks...`);

  for (let i = 0; i < CHUNKS.length; i++) {
    const text = CHUNKS[i];

    const output = await embed(text, { pooling: "mean", normalize: true });
    // output.data is a Float32Array
    const embedding = Array.from(output.data as Float32Array);

    const { error } = await supabase
      .from("knowledge")
      .insert({ text, embedding });

    if (error) {
      console.error(`Error inserting chunk ${i}:`, error.message);
    } else {
      console.log(`  [${i + 1}/${CHUNKS.length}] inserted`);
    }
  }

  console.log("\nDone. All chunks embedded and stored in Supabase.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
