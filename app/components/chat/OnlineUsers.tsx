// app/components/chat/OnlineUsers.tsx
'use client';

import { useChat } from '../providers/ChatProvider';
import { useAuth } from '../../contexts/AuthContext';

export function OnlineUsers() {
  const { onlineUsers } = useChat();
  const { user } = useAuth();

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Online Users ({onlineUsers.length})
      </h2>
      
      {onlineUsers.length === 0 ? (
        <p className="text-gray-400 text-sm">No users online</p>
      ) : (
        <div className="space-y-2">
          {onlineUsers.map((onlineUser) => {
            const isCurrentUser = onlineUser.id === user?.uid;
            
            return (
              <div
                key={onlineUser.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {onlineUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {onlineUser.name}
                    {isCurrentUser && (
                      <span className="text-xs text-gray-500 ml-1">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">Online</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
