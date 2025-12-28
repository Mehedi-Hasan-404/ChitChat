// app/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { chatService } from '../lib/db';

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Generate a random user ID
function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Generate a random username
function generateUsername() {
  const adjectives = ['Happy', 'Lucky', 'Sunny', 'Bright', 'Cool', 'Swift', 'Smart', 'Bold'];
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Lion', 'Fox', 'Wolf', 'Bear', 'Hawk'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Immediately set loading to false if we're on server
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      // Check if user exists in localStorage
      let storedUserId = localStorage.getItem('chitchat_user_id');
      let storedUsername = localStorage.getItem('chitchat_username');

      if (!storedUserId || !storedUsername) {
        // Create new anonymous user
        storedUserId = generateUserId();
        storedUsername = generateUsername();
        localStorage.setItem('chitchat_user_id', storedUserId);
        localStorage.setItem('chitchat_username', storedUsername);
      }

      const anonymousUser: User = {
        uid: storedUserId,
        displayName: storedUsername,
        email: `${storedUserId}@anonymous.local`,
      };

      setUser(anonymousUser);
      setLoading(false);

      // Initialize user in chat service asynchronously
      (async () => {
        try {
          // Create/update user profile
          await chatService.createOrUpdateUserProfile({
            id: anonymousUser.uid,
            name: anonymousUser.displayName,
            email: anonymousUser.email,
          });

          // Set user as online
          await chatService.setUserOnline(anonymousUser.uid, anonymousUser.displayName);
        } catch (error) {
          console.error('Error initializing user:', error);
        }
      })();

      // Set up heartbeat to maintain online status
      const heartbeatInterval = setInterval(() => {
        chatService.setUserOnline(anonymousUser.uid, anonymousUser.displayName).catch(err => {
          console.error('Heartbeat error:', err);
        });
      }, 30000); // Every 30 seconds

      // Cleanup on unmount
      return () => {
        clearInterval(heartbeatInterval);
        chatService.setUserOffline(anonymousUser.uid).catch(err => {
          console.error('Error setting user offline:', err);
        });
      };
    } catch (error) {
      console.error('Error in AuthProvider:', error);
      // Even if there's an error, stop loading
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    try {
      if (user) {
        await chatService.setUserOffline(user.uid);
        localStorage.removeItem('chitchat_user_id');
        localStorage.removeItem('chitchat_username');
      }
      
      // Generate new user
      const newUserId = generateUserId();
      const newUsername = generateUsername();
      localStorage.setItem('chitchat_user_id', newUserId);
      localStorage.setItem('chitchat_username', newUsername);
      
      const newUser: User = {
        uid: newUserId,
        displayName: newUsername,
        email: `${newUserId}@anonymous.local`,
      };
      
      setUser(newUser);
      
      // Set new user online asynchronously
      chatService.setUserOnline(newUser.uid, newUser.displayName).catch(err => {
        console.error('Error setting new user online:', err);
      });
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
