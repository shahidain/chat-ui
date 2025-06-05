import React from 'react';
import type { Message as MessageType } from '../types/chat';
import { User, Bot, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Chart from './Chart';
import './Message.css';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [isCopied, setIsCopied] = React.useState(false);
  const [showHoverTooltip, setShowHoverTooltip] = React.useState(false);
  
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      setShowHoverTooltip(false); // Hide hover tooltip on click
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleMouseEnter = () => {
    if (!isCopied) {
      setShowHoverTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowHoverTooltip(false);
  };
  
  const formatDateTime = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear().toString().slice(-4);
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `${day}-${month}-${year}, ${time}`;
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
                code: ({ className, children }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const isCodeBlock = match && className?.includes('language-');                  if (isCodeBlock) {
                    return (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={language}
                        PreTag="div"
                        customStyle={{
                          margin: '0 0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          lineHeight: '0',
                          maxWidth: '100%',
                          overflow: 'auto',
                          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                          backgroundColor: '#1e1e1e',
                          border: '1px solid #333',
                          padding: '16px'
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }
                  return (
                    <code 
                      className={className}
                      style={{
                        backgroundColor: '#2d2d30',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        color: '#9cdcfe',
                        border: '1px solid #464647'
                      }}
                    >
                      {children}
                    </code>
                  );
                },
                img: ({ src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt}
                    className={isUser ? 'message-image-user' : 'message-image-bot'}
                    {...props}
                  />
                ),
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
        {message.chartData && (
          <Chart chartData={message.chartData} />
        )}        {!message.isTyping && (
           <div className="message-timestamp">
            {isUser && (
              <div className="copy-icon-container">
                <Copy 
                  size={12} 
                  className={`copy-icon ${isCopied ? 'copy-icon-copied' : ''}`}
                  onClick={handleCopyMessage}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
                {showHoverTooltip && <span className="copy-tooltip-hover">Copy Message</span>}
                {isCopied && <span className="copy-tooltip">Copied!</span>}
              </div>
            )}
            {formatDateTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
