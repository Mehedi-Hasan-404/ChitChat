// lib/db/firebase.ts

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, push, serverTimestamp, onDisconnect, set, remove, query, limitToLast } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ChatService, Message, UserProfile, OnlineUser, TypingUser } from '../types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase only on client side
let app: any = null;
let db: any = null;
let storage: any = null;

if (typeof window !== 'undefined') {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getDatabase(app);
  storage = getStorage(app);
}

const DB_PATH = 'chatkat_main_chat';

export const firebaseService: ChatService = {
  init(onMessages, onOnlineUsers, onTypingUsers) {
    if (!db) {
      console.error('Firebase database not initialized');
      return;
    }

    const messagesQuery = query(ref(db, `${DB_PATH}/messages`), limitToLast(100));
    onValue(messagesQuery, (snapshot) => {
      const messagesData = snapshot.val();
      const messagesArray: Message[] = messagesData 
        ? Object.entries(messagesData).map(([id, msg]: [string, any]) => ({ id, ...msg })) 
        : [];
      onMessages(messagesArray);
    });

    const presenceRef = ref(db, `${DB_PATH}/presence`);
    onValue(presenceRef, (snapshot) => {
        const presenceData = snapshot.val();
        const usersArray: OnlineUser[] = presenceData
            ? Object.entries(presenceData).map(([sessionId, user]: [string, any]) => ({ sessionId, name: user.name }))
            : [];
        onOnlineUsers(usersArray);
    });

    const typingRef = ref(db, `${DB_PATH}/typing`);
    onValue(typingRef, (snapshot) => {
        const typingData = snapshot.val();
        const usersArray: TypingUser[] = typingData
            ? Object.entries(typingData).map(([sessionId, user]: [string, any]) => ({ sessionId, name: user.name }))
            : [];
        onTypingUsers(usersArray);
    });
  },

  async sendMessage(message) {
    if (!db) {
      console.error('Firebase database not initialized');
      return;
    }
    const messagesRef = ref(db, `${DB_PATH}/messages`);
    await push(messagesRef, { ...message, timestamp: serverTimestamp() });
  },

  async uploadImage(file) {
    if (!storage) {
      throw new Error('Firebase storage not initialized');
    }
    const filePath = `chat_images/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },

  setTypingStatus(user, isTyping) {
    if (!db) {
      console.error('Firebase database not initialized');
      return;
    }
    const myTypingRef = ref(db, `${DB_PATH}/typing/${user.sessionId}`);
    if (isTyping) {
      set(myTypingRef, { name: user.name });
      onDisconnect(myTypingRef).remove();
    } else {
      remove(myTypingRef);
    }
  },

  setupPresence(user) {
    if (!db) {
      console.error('Firebase database not initialized');
      return;
    }
    const myPresenceRef = ref(db, `${DB_PATH}/presence/${user.sessionId}`);
    const connectedRef = ref(db, '.info/connected');
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        set(myPresenceRef, { name: user.name, last_seen: serverTimestamp() });
        onDisconnect(myPresenceRef).remove();
      }
    });
  },

  cleanup() {
    // Firebase handles listener cleanup internally, but if you had specific
    // off() calls, they would go here. For this app, onDisconnect handles it.
  },
};
