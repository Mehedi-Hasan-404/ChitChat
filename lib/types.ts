// lib/types.ts

export interface UserProfile {
  name: string;
  pic: string;
  sessionId: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender: {
    name: string;
    pic: string;
  };
  sessionId: string;
}

export interface TypingUser {
  name: string;
  sessionId: string;
}

export interface OnlineUser {
  name: string;
  sessionId: string;
}

export interface ChatService {
  init(onMessages: (messages: Message[]) => void, onOnlineUsers: (users: OnlineUser[]) => void, onTypingUsers: (users: TypingUser[]) => void): void;
  sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<void>;
  uploadImage(file: File): Promise<string>;
  setTypingStatus(user: UserProfile, isTyping: boolean): void;
  setupPresence(user: UserProfile): void;
  cleanup(): void;
}
