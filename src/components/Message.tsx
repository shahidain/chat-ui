import React from 'react';
import type { Message as MessageType } from '../types/chat';
import { User, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Message.css';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={clsx('message', isUser ? 'message-user' : 'message-bot')}>
      <div className="message-avatar">
        {isUser ? (
          <User size={20} />
        ) : (
          <Bot size={20} />
        )}
      </div>
      <div className="message-content">
        <div className="message-text">
          {message.isTyping ? (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children, ...props }) => (
                  <div className="table-container">
                    <table {...props}>{children}</table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th {...props}>{children}</th>
                ),
                td: ({ children, ...props }) => (
                  <td {...props}>{children}</td>
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </div>
        <div className="message-timestamp">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message;
