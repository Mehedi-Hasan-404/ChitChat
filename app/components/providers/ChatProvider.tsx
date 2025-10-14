// components/providers/ChatProvider.tsx

'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { UserProfile, Message, OnlineUser, TypingUser } from '@/lib/types';
import { dbService } from '@/lib/db';

interface ChatContextType {
  user: UserProfile | null;
  messages: Message[];
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  status: 'connecting' | 'connected' | 'error';
  saveUserProfile: (name: string, pic: string) => void;
  sendMessage: (text: string) => void;
  uploadAndSendMessage: (file: File) => void;
  setTyping: (isTyping: boolean) => void;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user profile from localStorage on initial load
  useEffect(() => {
    if (!isClient) return;

    try {
      const savedName = localStorage.getItem('userName');
      const savedPic = localStorage.getItem('profilePic') || '';
      let sessionId = localStorage.getItem('sessionId');
      
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('sessionId', sessionId);
      }

      if (savedName) {
        const loadedUser = { name: savedName, pic: savedPic, sessionId };
        setUser(loadedUser);
        setStatus('connected');
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, [isClient]);

  // Initialize database connection and listeners when user is set
  useEffect(() => {
    if (!user || !isClient) return;

    try {
      dbService.init(
        (newMessages) => setMessages(newMessages),
        (newOnlineUsers) => setOnlineUsers(newOnlineUsers),
        (newTypingUsers) => setTypingUsers(newTypingUsers.filter(u => u.sessionId !== user.sessionId))
      );
      dbService.setupPresence(user);
      setStatus('connected');
    } catch (error) {
      console.error("DB initialization failed:", error);
      setStatus('error');
    }

    return () => dbService.cleanup();
  }, [user, isClient]);

  const saveUserProfile = useCallback((name: string, pic: string) => {
    if (!isClient) return;

    try {
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('sessionId', sessionId);
      }
      const newUser = { name, pic, sessionId };
      localStorage.setItem('userName', name);
      localStorage.setItem('profilePic', pic);
      setUser(newUser);
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, [isClient]);
  
  const sendMessage = useCallback((text: string) => {
    if (!user || text.trim() === '') return;
    const messageData = {
      text,
      sender: { name: user.name, pic: user.pic },
      sessionId: user.sessionId,
    };
    dbService.sendMessage(messageData);
  }, [user]);

  const uploadAndSendMessage = useCallback(async (file: File) => {
    if(!user) return;
    try {
      const imageUrl = await dbService.uploadImage(file);
      sendMessage(imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image.");
    }
  }, [user, sendMessage]);

  const setTyping = useCallback((isCurrentlyTyping: boolean) => {
    if (!user) return;
    
    if (typingTimeout) clearTimeout(typingTimeout);

    if (isCurrentlyTyping) {
      if (!isTyping) {
        dbService.setTypingStatus(user, true);
        setIsTyping(true);
      }
      const newTimeout = setTimeout(() => {
        dbService.setTypingStatus(user, false);
        setIsTyping(false);
      }, 2000);
      setTypingTimeout(newTimeout);
    }
  }, [user, isTyping, typingTimeout]);

  const contextValue = useMemo(() => ({
    user,
    messages,
    onlineUsers,
    typingUsers,
    status,
    saveUserProfile,
    sendMessage,
    uploadAndSendMessage,
    setTyping,
  }), [user, messages, onlineUsers, typingUsers, status, saveUserProfile, sendMessage, uploadAndSendMessage, setTyping]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};
