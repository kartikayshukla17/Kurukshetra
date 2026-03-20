export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ApiError {
  type: "network" | "rate_limit" | "server" | "unknown";
  message: string;
  retryAfter?: number; // seconds, for rate limit
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: ApiError | null;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  retry: () => void;
  dismissError: () => void;
  clearConversation: () => void;
}
