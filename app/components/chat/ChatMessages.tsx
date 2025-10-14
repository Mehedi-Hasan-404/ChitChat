// components/chat/ChatMessages.tsx

'use client';

import { useChat } from '@/lib/hooks/useChat';
import { Message } from './Message';
import { useEffect, useRef } from 'react';

export const ChatMessages = () => {
  const { messages, user } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!user) {
    return <div className="flex-grow flex items-center justify-center"><p>Loading chat...</p></div>;
  }

  return (
    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 bg-bg-light dark:bg-dark-bg-light">
      {messages.map(msg => (
        <Message key={msg.id} message={msg} currentUser={user} />
      ))}
    </div>
  );
};
