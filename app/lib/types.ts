// lib/types.ts

export interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  lastSeen?: number;
}

export interface OnlineUser {
  id: string;
  name: string;
  lastSeen: number;
}

export interface TypingUser {
  id: string;
  name: string;
  isTyping: boolean;
}

export interface ChatService {
  // Message operations
  sendMessage(message: Message): Promise<void>;
  subscribeToMessages(callback: (messages: Message[]) => void): () => void;
  
  // User profile operations
  createOrUpdateUserProfile(profile: UserProfile): Promise<void>;
  getUserProfile(userId: string): Promise<UserProfile | null>;
  
  // Online status operations
  setUserOnline(userId: string, userName: string): Promise<void>;
  setUserOffline(userId: string): Promise<void>;
  subscribeToOnlineUsers(callback: (users: OnlineUser[]) => void): () => void;
  
  // Typing indicator operations
  setUserTyping(userId: string, userName: string, isTyping: boolean): Promise<void>;
  subscribeToTypingUsers(callback: (users: TypingUser[]) => void): () => void;
}
