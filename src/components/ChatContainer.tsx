import React, { useState, useCallback, useEffect } from 'react';
import type { Message, ChatSession, AppState } from '../types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Sidebar from './Sidebar';
import { MessageSquare, Settings, MoreVertical, Menu } from 'lucide-react';
import { clsx } from 'clsx';
import './ChatContainer.css';
import { sendMessage, connectToServer } from '../mcp-server/connection';


const ChatContainer: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    sessions: [],
    currentSessionId: null,
    sidebarOpen: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const generateChatTitle = (firstMessage: string): string => {
    // Generate a title from the first message
    const words = firstMessage.trim().split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  };

  const simulateBotResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Table-specific responses
    if (lowerMessage.includes('table') || lowerMessage.includes('data') || lowerMessage.includes('comparison')) {
      return `Here's a sample table with some data:

| Product | Price | Rating | Stock |
|---------|-------|--------|-------|
| iPhone 15 | $999 | ⭐⭐⭐⭐⭐ | In Stock |
| Samsung Galaxy S24 | $899 | ⭐⭐⭐⭐ | Limited |
| Google Pixel 8 | $699 | ⭐⭐⭐⭐ | In Stock |
| OnePlus 12 | $799 | ⭐⭐⭐⭐ | Out of Stock |

This table demonstrates **markdown table formatting** with various data types including text, prices, ratings, and status indicators.`;
    }

    if (lowerMessage.includes('schedule') || lowerMessage.includes('calendar') || lowerMessage.includes('time')) {
      return `Here's this week's schedule:

| Day | Morning | Afternoon | Evening |
|-----|---------|-----------|---------|
| Monday | Team Meeting | Code Review | **Free Time** |
| Tuesday | Project Planning | Development | Client Call |
| Wednesday | *Design Review* | Testing | Documentation |
| Thursday | Sprint Planning | Implementation | Code Review |
| Friday | Demo Preparation | **Team Demo** | Retrospective |

You can see how tables can include **bold text**, *italic text*, and other markdown formatting!`;
    }

    const responses = [
      "That's an interesting point! Can you tell me more about it?",
      "I understand what you're saying. How can I help you with that?",
      "Thanks for sharing that with me. What would you like to know?",
      "That sounds important to you. Would you like to explore this further?",
      "I see. Can you provide more details about this topic?",
      "Interesting! What's your perspective on this?",
      "I appreciate you bringing this up. How can I assist you?",
      "That's a great question! Let me think about that for a moment.",
      "I understand your concern. What specific information are you looking for?",
      "Thank you for explaining that. What would be most helpful for you right now?"
    ];

    // Simple keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to our chat. How can I assist you today?\n\nTry asking me about **tables**, **schedules**, or **data** to see markdown table examples!";
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return "I'm here to help! What do you need assistance with?\n\n**Tip:** I can show you markdown tables - just ask about 'table', 'data', or 'schedule'!";
    }
    if (lowerMessage.includes('thank')) {
      return "You're very welcome! Is there anything else I can help you with?";
    }
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Goodbye! It was great chatting with you. Have a wonderful day!";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  const handleMCPSerVerMessgeResponse = useCallback((sessionId: string, data: string, done: boolean, _streamMessageId: string | null) => {
    setAppState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session => {
        if (session.id === sessionId) {
          const updatedMessages = [...session.messages];
          
          // If this is the first chunk and no streaming message exists, create a new bot message
          if (_streamMessageId) {
            const messageIndex = updatedMessages.findIndex(msg => msg.id === _streamMessageId);
            if (messageIndex === -1) {
              const newStreamingMessage: Message = {
                id: _streamMessageId,
                text: data,
                sender: 'bot',
                timestamp: new Date()
              };
              updatedMessages.push(newStreamingMessage);
            } else {
              // Update the existing streaming message
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                text: data,
                timestamp: new Date()
              };
            }
          } 
          return {
            ...session,
            messages: updatedMessages,
            lastActivity: new Date()
          };
        }
        return session;
      })
    }));
    setIsLoading(!done);
  }, []);

  const createNewSession = useCallback((): ChatSession => {
    const now = new Date();
    return {
      id: generateId(),
      title: "New Chat",
      messages: [],
      lastActivity: now,
      createdAt: now
    };
  }, []);

  const handleNewChat = useCallback(() => {
    const newSession = createNewSession();
    setAppState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      currentSessionId: newSession.id
    }));
  }, [createNewSession]);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setAppState(prev => ({
      ...prev,
      currentSessionId: sessionId,
      sidebarOpen: false // Close sidebar on mobile when selecting session
    }));
  }, []);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setAppState(prev => {
      const newSessions = prev.sessions.filter(s => s.id !== sessionId);
      let newCurrentSessionId = prev.currentSessionId;
      
      if (prev.currentSessionId === sessionId) {
        newCurrentSessionId = newSessions.length > 0 ? newSessions[0].id : null;
      }
      
      return {
        ...prev,
        sessions: newSessions,
        currentSessionId: newCurrentSessionId
      };
    });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setAppState(prev => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen
    }));
  }, []);

  const handleSendMessage = useCallback(async (messageText: string) => {
    const _streamMessageId = generateId();
    let sessionId = appState.currentSessionId;
  
    if (!sessionId) {
      const newSession = createNewSession();
      sessionId = newSession.id;
      
      setAppState(prev => ({
        ...prev,
        sessions: [newSession, ...prev.sessions],
        currentSessionId: sessionId
      }));
    }

    const userMessage: Message = {
      id: generateId(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message immediately and update session
    setAppState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session => {
        if (session.id === sessionId) {
          const updatedMessages = [...session.messages, userMessage];
          return {
            ...session,
            messages: updatedMessages,
            title: session.messages.length === 0 ? generateChatTitle(messageText) : session.title,
            lastActivity: new Date()
          };
        }
        return session;
      })    }));    
    setIsLoading(true);
    
    try {
      sendMessage(
        sessionId,
        messageText,
        (data: string, done: boolean) => handleMCPSerVerMessgeResponse(sessionId!, data, done, _streamMessageId)
      );
    } catch (error) {
      console.warn('MCP server not available, using fallback response:', error);
      
      // Fallback to simulated response
      setTimeout(() => {
        const botResponse: Message = {
          id: generateId(),
          text: simulateBotResponse(messageText),
          sender: 'bot',
          timestamp: new Date()
        };

        setAppState(prev => ({
          ...prev,
          sessions: prev.sessions.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                messages: [...session.messages, botResponse],
                lastActivity: new Date()
              };
            }
            return session;
          })
        }));
        
        setIsLoading(false);
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }

  }, [appState.currentSessionId, createNewSession, handleMCPSerVerMessgeResponse, simulateBotResponse]);

  const getCurrentSession = (): ChatSession | null => {
    return appState.sessions.find(s => s.id === appState.currentSessionId) || null;
  };

  const currentSession = getCurrentSession();

  const handleMessageResponse = (data: unknown) => {
    console.log(`Message response is ${data}`)
  };

  // Auto-open sidebar on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 769) {
        setAppState(prev => ({ ...prev, sidebarOpen: true }));
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    connectToServer(handleMessageResponse);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className={clsx('chat-app', appState.sidebarOpen && 'sidebar-open')}>
      <Sidebar
        sessions={appState.sessions}
        currentSessionId={appState.currentSessionId}
        isOpen={appState.sidebarOpen}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="chat-container">
        <header className="chat-header">
          <div className="chat-header-left">
            <button
              className="mobile-menu-btn"
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="chat-icon">
              <MessageSquare size={24} />
            </div>
            <div className="chat-info">
              <h1 className="chat-title">
                {currentSession?.title || 'AI Assistant'}
              </h1>
              <p className="chat-subtitle">
                {currentSession ? 
                  `${currentSession.messages.length} messages` : 
                  'Always here to help'
                }
              </p>
            </div>
          </div>
          <div className="chat-header-right">
            <button 
              className="header-button"
              onClick={handleNewChat}
              aria-label="New chat"
              title="New chat"
            >
              New
            </button>
            <button 
              className="header-button"
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button 
              className="header-button"
              aria-label="More options"
              title="More options"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        <main className="chat-main">
          <MessageList 
            messages={currentSession?.messages || []} 
            isLoading={isLoading}
          />
        </main>

        <footer className="chat-footer">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder="Type your message..."
          />
        </footer>
      </div>
    </div>
  );
};

export default ChatContainer;
