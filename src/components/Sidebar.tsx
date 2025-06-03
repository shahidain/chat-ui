import React from 'react';
import type { ChatSession } from '../types/chat';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import './Sidebar.css';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isOpen: boolean;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  isOpen,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onToggleSidebar
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const truncateTitle = (title: string, maxLength: number = 25) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onToggleSidebar} />
      )}
      
      {/* Sidebar */}
      <aside className={clsx('sidebar', isOpen && 'sidebar-open')}>
        <div className="sidebar-header">
          <button
            className="new-chat-btn"
            onClick={onNewChat}
            aria-label="Start new chat"
          >
            <Plus size={18} />
            <span>Start New Chat With AI</span>
          </button>
        </div>

        <div className="sidebar-content">
          <div className="chat-history">
            <h3 className="history-title">Recent Chats</h3>
            
            {sortedSessions.length === 0 ? (
              <div className="empty-history">
                <MessageSquare size={32} />
                <p>No chat history yet</p>
                <span>Start a new conversation</span>
              </div>
            ) : (
              <div className="session-list">
                {sortedSessions.map((session) => (
                  <div
                    key={session.id}
                    className={clsx(
                      'session-item',
                      currentSessionId === session.id && 'session-active'
                    )}
                    onClick={() => onSessionSelect(session.id)}
                  >
                    <div className="session-content">
                      <div className="session-icon">
                        <MessageSquare size={16} />
                      </div>
                      <div className="session-info">
                        <div className="session-title">
                          {truncateTitle(session.title)}
                        </div>
                        <div className="session-meta">
                          <span className="session-time">
                            {formatDate(new Date(session.lastActivity))}
                          </span>
                          <span className="session-count">
                            {session.messages.length} messages
                          </span>
                        </div>
                      </div>
                    </div>                    <button
                      className="delete-session-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      aria-label="Delete chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="app-info">
            <span style={{fontSize: "14px", color:"#000"}}>JP Morgan Chase & Co.</span>
            <div style={{fontSize: "11px", color:"#000"}}>Version: 1.0.1 &copy;2025 JP Morgan</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
