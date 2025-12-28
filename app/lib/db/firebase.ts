// lib/db/firebase.ts

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  push, 
  onValue, 
  set, 
  remove,
  onDisconnect,
  serverTimestamp,
  Database,
  get,
  query,
  orderByChild,
  limitToLast
} from 'firebase/database';
import { ChatService, Message, UserProfile, OnlineUser, TypingUser } from '../types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let auth: Auth;
let database: Database;

// Initialize Firebase only on client side
if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export const firebaseService: ChatService = {
  async sendMessage(message: Message): Promise<void> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const messagesRef = ref(database, 'messages');
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      ...message,
      timestamp: serverTimestamp()
    });
  },

  subscribeToMessages(callback: (messages: Message[]) => void): () => void {
    if (!database) {
      console.error('Firebase not initialized');
      return () => {};
    }

    const messagesRef = ref(database, 'messages');
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        messages.push({
          id: childSnapshot.key!,
          content: data.content,
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp || Date.now()
        });
      });
      callback(messages);
    }, (error) => {
      console.error('Error subscribing to messages:', error);
    });

    return unsubscribe;
  },

  async createOrUpdateUserProfile(profile: UserProfile): Promise<void> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const userRef = ref(database, `users/${profile.id}`);
    await set(userRef, {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      lastSeen: serverTimestamp()
    });
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  },

  async setUserOnline(userId: string, userName: string): Promise<void> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const onlineUserRef = ref(database, `onlineUsers/${userId}`);
    const userStatusRef = ref(database, `users/${userId}/status`);
    
    // Set user as online
    await set(onlineUserRef, {
      id: userId,
      name: userName,
      lastSeen: serverTimestamp()
    });

    await set(userStatusRef, 'online');

    // Set up disconnect handler
    onDisconnect(onlineUserRef).remove();
    onDisconnect(userStatusRef).set('offline');
  },

  async setUserOffline(userId: string): Promise<void> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const onlineUserRef = ref(database, `onlineUsers/${userId}`);
    const userStatusRef = ref(database, `users/${userId}/status`);
    
    await remove(onlineUserRef);
    await set(userStatusRef, 'offline');
  },

  subscribeToOnlineUsers(callback: (users: OnlineUser[]) => void): () => void {
    if (!database) {
      console.error('Firebase not initialized');
      return () => {};
    }

    const onlineUsersRef = ref(database, 'onlineUsers');
    
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const users: OnlineUser[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        users.push({
          id: data.id,
          name: data.name,
          lastSeen: data.lastSeen
        });
      });
      callback(users);
    }, (error) => {
      console.error('Error subscribing to online users:', error);
    });

    return unsubscribe;
  },

  async setUserTyping(userId: string, userName: string, isTyping: boolean): Promise<void> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const typingRef = ref(database, `typing/${userId}`);
    
    if (isTyping) {
      await set(typingRef, {
        id: userId,
        name: userName,
        isTyping: true,
        timestamp: serverTimestamp()
      });
      
      // Auto-remove typing status after 5 seconds
      onDisconnect(typingRef).remove();
    } else {
      await remove(typingRef);
    }
  },

  subscribeToTypingUsers(callback: (users: TypingUser[]) => void): () => void {
    if (!database) {
      console.error('Firebase not initialized');
      return () => {};
    }

    const typingRef = ref(database, 'typing');
    
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const users: TypingUser[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        users.push({
          id: data.id,
          name: data.name,
          isTyping: data.isTyping
        });
      });
      callback(users);
    }, (error) => {
      console.error('Error subscribing to typing users:', error);
    });

    return unsubscribe;
  }
};

export { auth, database };
