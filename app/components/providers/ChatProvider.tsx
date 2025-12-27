// app/components/providers/ChatProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { chatService } from '@/app/lib/db';
import { Message, UserProfile, OnlineUser, TypingUser } from '@/app/lib/types';

interface ChatContextType {
  messages: Message[];
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  user: UserProfile | null;
  sendMessage: (content: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load user profile
  useEffect(() => {
    if (!authUser) {
      setUser(null);
      return;
    }

    const loadUserProfile = async () => {
      const profile = await chatService.getUserProfile(authUser.uid);
      if (profile) {
        setUser(profile);
      } else {
        // Create default profile
        const defaultProfile: UserProfile = {
          id: authUser.uid,
          name: authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous',
          email: authUser.email || '',
          avatarUrl: authUser.photoURL || undefined
        };
        await chatService.createOrUpdateUserProfile(defaultProfile);
        setUser(defaultProfile);
      }
    };

    loadUserProfile();
  }, [authUser]);

  // Subscribe to messages
  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages((newMessages) => {
      setMessages(newMessages);
    });

    return unsubscribe;
  }, []);

  // Subscribe to online users
  useEffect(() => {
    const unsubscribe = chatService.subscribeToOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    return unsubscribe;
  }, []);

  // Subscribe to typing users
  useEffect(() => {
    const unsubscribe = chatService.subscribeToTypingUsers((users) => {
      setTypingUsers(users);
    });

    return unsubscribe;
  }, []);

  const sendMessage = async (content: string) => {
    if (!authUser || !user) {
      throw new Error('User not authenticated');
    }

    const message: Message = {
      id: '', // Will be set by the database
      content,
      userId: authUser.uid,
      userName: user.name,
      timestamp: Date.now()
    };

    await chatService.sendMessage(message);
  };

  const setTyping = async (isTyping: boolean) => {
    if (!authUser || !user) return;

    await chatService.setUserTyping(authUser.uid, user.name, isTyping);
  };

  const saveUserProfile = async (updates: Partial<UserProfile>) => {
    if (!authUser || !user) {
      throw new Error('User not authenticated');
    }

    const updatedProfile: UserProfile = {
      ...user,
      ...updates
    };

    await chatService.createOrUpdateUserProfile(updatedProfile);
    setUser(updatedProfile);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        onlineUsers,
        typingUsers,
        user,
        sendMessage,
        setTyping,
        saveUserProfile
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
