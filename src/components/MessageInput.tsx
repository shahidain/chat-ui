import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface MessageInputHandle {
  focus: () => void;
}

const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}, ref) => {
  const [message, setMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDraft, setCurrentDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Expose focus method via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      const trimmedMessage = message.trim();
      
      // Add to message history (avoid duplicates)
      setMessageHistory(prev => {
        const newHistory = prev.filter(msg => msg !== trimmedMessage);
        return [trimmedMessage, ...newHistory].slice(0, 50); // Keep last 50 messages
      });
      
      onSendMessage(trimmedMessage);
      setMessage('');
      setHistoryIndex(-1);
      setCurrentDraft('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    }  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (messageHistory.length === 0) return;

    if (direction === 'up') {
      if (historyIndex === -1) {
        // Save current draft before entering history
        setCurrentDraft(message);
        setHistoryIndex(0);
        setMessage(messageHistory[0]);
      } else if (historyIndex < messageHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setMessage(messageHistory[newIndex]);
      }
    } else if (direction === 'down') {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setMessage(messageHistory[newIndex]);
      } else if (historyIndex === 0) {
        // Return to draft
        setHistoryIndex(-1);
        setMessage(currentDraft);
      }
    }

    // Auto-resize textarea after content change
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }, 0);  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Reset history navigation when user starts typing
    if (historyIndex !== -1) {
      setHistoryIndex(-1);
      setCurrentDraft(newValue);
    }
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }  };

  useEffect(() => {
    // Focus on initial mount
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="message-input-wrapper">
          <button 
            type="button" 
            className="attachment-button"
            aria-label="Attach file"
            disabled={disabled}
          >
            <Paperclip size={20} />
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="message-textarea"
            rows={1}
            aria-label="Message input"
          />
          
          <button 
            type="button" 
            className="voice-button"
            aria-label="Voice message"
            disabled={disabled}
          >
            <Mic size={20} />
          </button>
          
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="send-button"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </form>    </div>
  );
});

export default MessageInput;
