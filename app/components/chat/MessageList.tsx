// app/components/chat/MessageList.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '../providers/ChatProvider';
import { useAuth } from '../../contexts/AuthContext';

export function MessageList() {
  const { messages, typingUsers } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter out current user from typing users
  const otherTypingUsers = typingUsers.filter(u => u.id !== user?.uid);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.userId === user?.uid;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-semibold mb-1 opacity-70">
                    {message.userName}
                  </p>
                )}
                <p className="break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })
      )}

      {/* Typing Indicator */}
      {otherTypingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
            <p className="text-sm">
              {otherTypingUsers.map(u => u.name).join(', ')} {otherTypingUsers.length === 1 ? 'is' : 'are'} typing...
            </p>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
