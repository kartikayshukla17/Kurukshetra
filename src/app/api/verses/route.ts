import { NextRequest, NextResponse } from "next/server";

// Popular verses shown by default
const DEFAULT_VERSES = [
  { ch: 2, sl: 47, tag: "Dharma" },
  { ch: 2, sl: 20, tag: "Dharma" },
  { ch: 2, sl: 14, tag: "Yoga" },
  { ch: 3, sl: 27, tag: "Karma" },
  { ch: 4, sl: 7,  tag: "Dharma" },
  { ch: 6, sl: 5,  tag: "Yoga" },
  { ch: 9, sl: 26, tag: "Bhakti" },
  { ch: 10, sl: 20, tag: "Dharma" },
  { ch: 18, sl: 65, tag: "Bhakti" },
  { ch: 18, sl: 66, tag: "Bhakti" },
];

// Fallback local dataset for keyword search (API has no search endpoint)
const LOCAL_VERSES = [
  { id: "2.47",  tag: "Dharma", context: "18th Day of Kurukshetra",  quote: "Your right is to work only, but never to its fruits; let not the fruit of action be your motive, nor let your attachment be to inaction." },
  { id: "2.20",  tag: "Dharma", context: "The Indestructible Self",   quote: "The soul is never born nor dies at any time. It is unborn, eternal, ever-existing, and primeval. It is not slain when the body is slain." },
  { id: "2.14",  tag: "Yoga",   context: "Equanimity in Battle",      quote: "O son of Kunti, the nonpermanent appearance of happiness and distress are like winter and summer seasons. They arise from sense perception, and one must learn to tolerate them." },
  { id: "3.27",  tag: "Karma",  context: "The Illusion of Doership", quote: "The bewildered spirit thinks itself to be the doer of activities that are in every way carried out by the three modes of material nature." },
  { id: "4.7",   tag: "Dharma", context: "The Eternal Return",        quote: "Whenever dharma declines and the purpose of life is forgotten, I manifest myself on earth. I am born in every age to protect the good." },
  { id: "6.5",   tag: "Yoga",   context: "Twilight of Meditation",    quote: "Lift up the self by the Self and don't let the self droop down; for the Self is the self's only friend and the self is the self's only foe." },
  { id: "6.34",  tag: "Yoga",   context: "The Restless Mind",         quote: "The mind is restless, turbulent, obstinate and very strong, O Krishna, and to subdue it is more difficult than controlling the wind." },
  { id: "9.26",  tag: "Bhakti", context: "The Offering of Love",      quote: "If one offers Me with love and devotion a leaf, a flower, fruit or water, I will accept it." },
  { id: "10.20", tag: "Dharma", context: "Eternal Witness",           quote: "I am the Self seated in the hearts of all beings. I am the beginning, the middle and also the end of all beings." },
  { id: "12.13", tag: "Bhakti", context: "The Devotee's Qualities",   quote: "One who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego — he is very dear to Me." },
  { id: "16.21", tag: "Dharma", context: "Divine and Demonic",        quote: "There are three gates leading to the hell of self-destruction: lust, anger, and greed. Every sane man should give these up." },
  { id: "18.20", tag: "Karma",  context: "Knowledge by Mode",         quote: "That knowledge by which one undivided spiritual nature is seen in all living entities, though divided into innumerable forms — know that to be in the mode of goodness." },
  { id: "18.63", tag: "Yoga",   context: "The Final Teaching",        quote: "Thus I have explained to you knowledge still more confidential. Deliberate on this fully, and then do what you wish to do." },
  { id: "18.66", tag: "Bhakti", context: "Dawn of Surrender",         quote: "Abandoning all forms of dharma, surrender to Me alone. I shall liberate you from all sinful reactions; do not fear." },
];

interface GitaApiResponse {
  chapter: number;
  verse: number;
  slok?: string;
  purohit?: { et?: string };
  tej?: { et?: string };
  siva?: { et?: string };
  gamb?: { et?: string };
}

function extractQuote(data: GitaApiResponse): string {
  return (
    data.purohit?.et ||
    data.tej?.et ||
    data.siva?.et ||
    data.gamb?.et ||
    ""
  );
}

function getTag(ch: number, sl: number): string {
  const found = DEFAULT_VERSES.find((v) => v.ch === ch && v.sl === sl);
  if (found) return found.tag;
  // Rough heuristic by chapter
  if ([2, 4, 5, 10, 13, 15].includes(ch)) return "Dharma";
  if ([3, 11, 14, 18].includes(ch)) return "Karma";
  if ([6, 8, 17].includes(ch)) return "Yoga";
  return "Bhakti";
}

async function fetchVerse(ch: number, sl: number) {
  const res = await fetch(`https://vedicscriptures.github.io/slok/${ch}/${sl}`, {
    next: { revalidate: 86400 }, // cache 24h
  });
  if (!res.ok) return null;
  const data: GitaApiResponse = await res.json();
  const quote = extractQuote(data);
  if (!quote) return null;
  return {
    id: `${ch}.${sl}`,
    tag: getTag(ch, sl),
    context: `Chapter ${ch}, Verse ${sl}`,
    quote,
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  // Verse ref search: "2.47" or "2 47"
  const verseRef = q.match(/^(\d+)[.\s](\d+)$/);
  if (verseRef) {
    const ch = parseInt(verseRef[1]);
    const sl = parseInt(verseRef[2]);
    const verse = await fetchVerse(ch, sl);
    return NextResponse.json(verse ? [verse] : []);
  }

  // Keyword search — use local dataset
  if (q) {
    const lower = q.toLowerCase();
    const results = LOCAL_VERSES.filter(
      (v) =>
        v.quote.toLowerCase().includes(lower) ||
        v.tag.toLowerCase().includes(lower) ||
        v.context.toLowerCase().includes(lower)
    );
    return NextResponse.json(results);
  }

  // Default: fetch 10 popular verses from the API in parallel
  const results = await Promise.all(
    DEFAULT_VERSES.map((v) => fetchVerse(v.ch, v.sl))
  );
  return NextResponse.json(results.filter(Boolean));
}
