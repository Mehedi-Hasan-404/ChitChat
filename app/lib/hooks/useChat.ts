// lib/hooks/useChat.ts

import { useContext } from 'react';
import { ChatContext } from '@/components/providers/ChatProvider';

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
