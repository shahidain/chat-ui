import React, { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../types/chat';
import Message from './Message';
import './MessageList.css';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="message-list-container">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h3>Start a conversation</h3>
          <p>Smart data exploration through conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list-container" ref={containerRef}>
      <div className="message-list">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && (
          <Message
            message={{
              id: 'typing',
              text: '',
              sender: 'bot',
              timestamp: new Date(),
              isTyping: true
            }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
