// app/page.tsx
'use client';

import { useAuth } from './contexts/AuthContext';
import { ChatHeader } from './components/chat/ChatHeader';
import { MessageList } from './components/chat/MessageList';
import { MessageInput } from './components/chat/MessageInput';
import { OnlineUsers } from './components/chat/OnlineUsers';

export default function Home() {
  const { loading, user } = useAuth();

  console.log('Home render - loading:', loading, 'user:', user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-400 mt-2">If stuck, check browser console</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <MessageList />
        <MessageInput />
      </div>

      {/* Sidebar - Online Users */}
      <OnlineUsers />
    </div>
  );
}
