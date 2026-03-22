import "dotenv/config";
import { InferenceClient } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";
import { CHUNKS } from "../src/lib/chunks";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !HUGGINGFACE_API_KEY) {
  console.error("Missing SUPABASE_URL, SUPABASE_ANON_KEY, or HUGGINGFACE_API_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const hf = new InferenceClient(HUGGINGFACE_API_KEY);

async function main() {
  console.log(`Embedding ${CHUNKS.length} chunks via HuggingFace Inference API...`);

  for (let i = 0; i < CHUNKS.length; i++) {
    const text = CHUNKS[i];

    const output = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });
    const embedding = output as number[];

    const { error } = await supabase
      .from("knowledge")
      .insert({ text, embedding });

    if (error) {
      console.error(`Error inserting chunk ${i}:`, error.message);
    } else {
      console.log(`  [${i + 1}/${CHUNKS.length}] inserted`);
    }
  }

  console.log(`\nDone. All ${CHUNKS.length} chunks embedded and stored in Supabase.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
