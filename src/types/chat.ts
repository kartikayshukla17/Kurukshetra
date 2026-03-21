export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ApiError {
  type: "network" | "rate_limit" | "server" | "unknown";
  message: string;
  retryAfter?: number;
}

export interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
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
  newConversation: () => void;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
}
