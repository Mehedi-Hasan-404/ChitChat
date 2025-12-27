// components/providers/ChatProvider.tsx

'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { UserProfile, Message, OnlineUser, TypingUser, ReplyTo } from '@/lib/types';
import { dbService } from '@/lib/db';
import { sanitizeName, sanitizeProfilePicUrl } from '@/lib/security/sanitize';

interface ChatContextType {
  user: UserProfile | null;
  messages: Message[];
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  status: 'connecting' | 'connected' | 'error';
  replyingTo: Message | null;
  saveUserProfile: (name: string, pic: string) => void;
  sendMessage: (text: string) => void;
  uploadAndSendMessage: (file: File) => void;
  setTyping: (isTyping: boolean) => void;
  setReplyingTo: (message: Message | null) => void;
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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
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
        // Sanitize loaded data
        const sanitizedName = sanitizeName(savedName);
        const sanitizedPic = savedPic ? sanitizeProfilePicUrl(savedPic) : '';
        
        const loadedUser = { 
          name: sanitizedName || 'User', 
          pic: sanitizedPic, 
          sessionId 
        };
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
        (newMessages) => {
          // Sanitize incoming messages
          const sanitizedMessages = newMessages.map(msg => ({
            ...msg,
            text: msg.text || '',
            sender: {
              name: sanitizeName(msg.sender?.name || 'Unknown'),
              pic: msg.sender?.pic ? sanitizeProfilePicUrl(msg.sender.pic) : '',
            },
            replyTo: msg.replyTo ? {
              ...msg.replyTo,
              text: msg.replyTo.text || '',
              sender: {
                name: sanitizeName(msg.replyTo.sender?.name || 'Unknown'),
                pic: msg.replyTo.sender?.pic ? sanitizeProfilePicUrl(msg.replyTo.sender.pic) : '',
              }
            } : undefined,
          }));
          setMessages(sanitizedMessages);
        },
        (newOnlineUsers) => {
          // Sanitize online users
          const sanitizedUsers = newOnlineUsers.map(u => ({
            ...u,
            name: sanitizeName(u.name || 'Unknown'),
          }));
          setOnlineUsers(sanitizedUsers);
        },
        (newTypingUsers) => {
          // Sanitize typing users
          const sanitizedUsers = newTypingUsers
            .filter(u => u.sessionId !== user.sessionId)
            .map(u => ({
              ...u,
              name: sanitizeName(u.name || 'Unknown'),
            }));
          setTypingUsers(sanitizedUsers);
        }
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
      // Sanitize inputs
      const sanitizedName = sanitizeName(name);
      const sanitizedPic = pic ? sanitizeProfilePicUrl(pic) : '';
      
      if (!sanitizedName) {
        console.error('Invalid name provided');
        return;
      }
      
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('sessionId', sessionId);
      }
      
      const newUser = { name: sanitizedName, pic: sanitizedPic, sessionId };
      localStorage.setItem('userName', sanitizedName);
      localStorage.setItem('profilePic', sanitizedPic);
      setUser(newUser);
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, [isClient]);
  
  const sendMessage = useCallback((text: string) => {
    if (!user || !text || typeof text !== 'string') return;
    
    const trimmed = text.trim();
    if (trimmed === '' || trimmed.length > 5000) return;
    
    let replyToData: ReplyTo | undefined;
    if (replyingTo) {
      replyToData = {
        id: replyingTo.id,
        text: replyingTo.text || '',
        sender: {
          name: sanitizeName(replyingTo.sender?.name || 'Unknown'),
          pic: replyingTo.sender?.pic ? sanitizeProfilePicUrl(replyingTo.sender.pic) : '',
        },
      };
    }
    
    const messageData = {
      text: trimmed,
      sender: { 
        name: user.name, 
        pic: user.pic 
      },
      sessionId: user.sessionId,
      replyTo: replyToData,
    };
    
    dbService.sendMessage(messageData);
    setReplyingTo(null);
  }, [user, replyingTo]);

  const uploadAndSendMessage = useCallback(async (file: File) => {
    if (!user) return;
    
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File too large');
    }
    
    try {
      const imageUrl = await dbService.uploadImage(file);
      // The URL will be sanitized when rendering
      sendMessage(imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
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
    replyingTo,
    saveUserProfile,
    sendMessage,
    uploadAndSendMessage,
    setTyping,
    setReplyingTo,
  }), [user, messages, onlineUsers, typingUsers, status, replyingTo, saveUserProfile, sendMessage, uploadAndSendMessage, setTyping]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};
