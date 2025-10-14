// lib/db/index.ts

import { ChatService } from '../types';
import { firebaseService } from './firebase';
import { supabaseService } from './supabase';

const chatProvider = process.env.NEXT_PUBLIC_CHAT_PROVIDER;

let dbService: ChatService;

if (chatProvider === 'supabase') {
  console.log("Using Supabase as a backend.");
  dbService = supabaseService;
} else {
  console.log("Using Firebase as a backend.");
  dbService = firebaseService;
}

export { dbService };
