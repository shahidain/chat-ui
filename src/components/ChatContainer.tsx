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
      })
    }));    
    setIsLoading(true);
    sendMessage(
      sessionId,
      messageText,
      (data: string, done: boolean) => handleMCPSerVerMessgeResponse(sessionId!, data, done, _streamMessageId)
    );

  }, [appState.currentSessionId, createNewSession, handleMCPSerVerMessgeResponse]);

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
