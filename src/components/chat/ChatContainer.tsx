"use client";

import { useChat } from "@/hooks/useChat";
import Header from "@/components/layout/Header";
import MessageList from "./MessageList";
import SuggestedQuestions from "./SuggestedQuestions";
import ErrorBanner from "./ErrorBanner";
import ChatInput from "./ChatInput";
import ConversationSidebar from "./ConversationSidebar";

export default function ChatContainer() {
  const {
    messages,
    conversations,
    activeId,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    stopStreaming,
    retry,
    dismissError,
    clearConversation,
    newConversation,
    switchConversation,
    deleteConversation,
  } = useChat();

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-dvh bg-void">
      {/* Left sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onNew={newConversation}
        onSwitch={switchConversation}
        onDelete={deleteConversation}
      />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0 bg-atmosphere">
        <Header
          onClear={clearConversation}
          hasMessages={messages.length > 0}
        />

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

        {error && (
          <ErrorBanner
            error={error}
            onRetry={retry}
            onDismiss={dismissError}
          />
        )}

        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
