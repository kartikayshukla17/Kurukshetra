"use client";

import { useChat } from "@/hooks/useChat";
import Header from "@/components/layout/Header";
import MessageList from "./MessageList";
import SuggestedQuestions from "./SuggestedQuestions";
import ErrorBanner from "./ErrorBanner";
import ChatInput from "./ChatInput";

export default function ChatContainer() {
  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    stopStreaming,
    retry,
    dismissError,
    clearConversation,
  } = useChat();

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-dvh bg-atmosphere">
      <Header
        onClear={clearConversation}
        hasMessages={messages.length > 0}
      />

      {/* Main area */}
      <div
        className="flex-1 overflow-hidden flex flex-col"
        role="main"
        aria-label="Conversation with the oracle"
      >
        {isEmpty ? (
          <div className="flex-1 overflow-y-auto">
            <SuggestedQuestions onSelect={sendMessage} />
          </div>
        ) : (
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
          />
        )}
      </div>

      {/* Error banner above input */}
      {error && (
        <ErrorBanner
          error={error}
          onRetry={retry}
          onDismiss={dismissError}
        />
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}
