import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, ChatSession, AppState, ChartData, ChartDataResponse } from '../types/chat';
import type { MessageInputHandle } from './MessageInput';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Sidebar from './Sidebar';
import { Menu, RadioIcon } from 'lucide-react';
import { clsx } from 'clsx';
import './ChatContainer.css';
import { sendMessage, connectToServer, isJsonObject } from '../mcp-server/connection';


const ChatContainer: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    sessions: [],
    currentSessionId: null,
    sidebarOpen: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const inputRef = useRef<MessageInputHandle>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.trim().split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  };

  const handleNoConnection = useCallback((sessionId: string) => {
    setTimeout(()=>{
      setAppState(prev => ({
        ...prev,
        sessions: prev.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: [...session.messages, {
                id: generateId(),
                text: 'MCP server is not available.',
                sender: 'bot',
                timestamp: new Date()
              }]
            };
          }
          return session;
        })
      }));
      setIsLoading(false);
      setIsConnected(false);
    }, 1000 + Math.random() * 2000);
  }, []);

  const handleMCPSerVerMessgeResponse = useCallback((sessionId: string, data: string, done: boolean, _streamMessageId: string | null) => {
    const isJsonObjectData: boolean = isJsonObject(data);
    let parsedData: ChartDataResponse = {} as ChartDataResponse;
    if (isJsonObjectData)
      parsedData = JSON.parse(data) as ChartDataResponse;
    const chartMessage = parsedData?.analysis || 'No analysis available';
    setAppState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session => {
        if (session.id === sessionId) {
          const updatedMessages = [...session.messages];
          if (_streamMessageId) {
            const messageIndex = updatedMessages.findIndex(msg => msg.id === _streamMessageId);
            if (messageIndex === -1) {
              
              if (isJsonObjectData) {
                const newMessage: Message = {
                  id: _streamMessageId,
                  text: chartMessage,
                  sender: 'bot',
                  timestamp: new Date()
                };
                const chartData: ChartData = {
                  type: parsedData?.type || 'bar',
                  title: parsedData?.title || 'Chart',
                  data: parsedData?.data,
                  xKey: parsedData?.xKey,
                  yKey: parsedData?.yKey,
                  nameKey: parsedData?.xKey,
                  valueKey: parsedData?.yKey,
                }
                newMessage.chartData = chartData;
                updatedMessages.push(newMessage);
              } else {
                const newMessage: Message = {
                  id: _streamMessageId,
                  text: data || 'No response from server',
                  sender: 'bot',
                  timestamp: new Date()
                };
                updatedMessages.push(newMessage);
              }

            } else {
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                text: isJsonObjectData ? chartMessage : data || 'No response from server',
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
      currentSessionId: newSession.id,
      sidebarOpen: false // Close sidebar on mobile when starting new chat
    }));
    
    // Focus the input field after creating a new chat
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Small delay to ensure DOM is updated
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
      if (!isConnected) {
        handleNoConnection(sessionId!);
        return;
      }
      sendMessage(
        sessionId,
        messageText,
        (data: string, done: boolean) => handleMCPSerVerMessgeResponse(sessionId!, data, done, _streamMessageId)
      );
    } catch (error) {
      console.warn('MCP server not available, using fallback response:', error);
      handleNoConnection(sessionId!);
    }

  }, [appState.currentSessionId, createNewSession, handleMCPSerVerMessgeResponse, handleNoConnection, isConnected]);

  const getCurrentSession = (): ChatSession | null => {
    return appState.sessions.find(s => s.id === appState.currentSessionId) || null;
  };

  const currentSession = getCurrentSession();

  const handleMessageResponse = (data: unknown) => {
    if (typeof data === 'string') {
      setIsConnected(data === 'true');
      return;
    }
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
    connectToServer((data) => {
      handleMessageResponse(data);
    });
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
          <div className="chat-header-left">            <button
              className="mobile-menu-btn"
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar"
            >
            <Menu size={20} />
            </button>
            <div className="chat-icon">
              <img src="/infobyte.svg" alt="Chat Icon" className="chat-icon-image"/>
            </div>
            
          </div>
          <div className="chat-header-right">
            <div className="connection-status">
              <div 
                className={clsx('status-indicator', isConnected ? 'connected' : 'disconnected')}
                role="status"
                aria-live="polite"
                aria-label={`Connection status: ${isConnected ? 'Connected' : 'Not Connected'}`}
              >
                <span className="status-text">
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
                <div className="status-icon-wrapper">
                  <RadioIcon 
                    size={16} 
                    className={clsx('status-icon', isConnected ? 'connected-icon' : 'disconnected-icon')}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="chat-main">
          <MessageList 
            messages={currentSession?.messages || []} 
            isLoading={isLoading}
          />
        </main>        <footer className="chat-footer">
          <MessageInput
            ref={inputRef}
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
