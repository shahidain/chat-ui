export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  inputValue: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
  createdAt: Date;
}

export interface AppState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  sidebarOpen: boolean;
}
