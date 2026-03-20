export type QuestionCategory = "gita" | "character" | "event" | "philosophy";

export interface SuggestedQuestion {
  id: string;
  text: string;
  category: QuestionCategory;
}

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  gita: "Bhagavad Gita",
  character: "Character",
  event: "Event",
  philosophy: "Philosophy",
};

export const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  gita: "#D4A843",
  character: "#1E9E8E",
  event: "#E8652A",
  philosophy: "#7B6BA8",
};

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: "q1",
    text: "Why did Krishna allow the Mahabharata war when he had the power to stop it?",
    category: "gita",
  },
  {
    id: "q2",
    text: "Tell me about Karna — his birth, his choices, and his tragic fate.",
    category: "character",
  },
  {
    id: "q3",
    text: "What does the Bhagavad Gita teach about duty over personal attachment?",
    category: "gita",
  },
  {
    id: "q4",
    text: "Why was Draupadi's humiliation in the Sabha the point of no return?",
    category: "event",
  },
  {
    id: "q5",
    text: "What is the difference between dharma and adharma in the Mahabharata?",
    category: "philosophy",
  },
  {
    id: "q6",
    text: "Who was the greatest warrior at Kurukshetra — Arjuna, Karna, or Bhishma?",
    category: "character",
  },
];
