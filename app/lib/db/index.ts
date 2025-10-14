// lib/db/index.ts

import { ChatService } from '../types';
import { firebaseService } from './firebase';
import { supabaseService } from './supabase';

const chatProvider = process.env.NEXT_PUBLIC_CHAT_PROVIDER;

let dbService: ChatService;

if (chatProvider === 'supabase') {
  console.log("Using Supabase as a backend.");
  dbService = supabaseService;
} else if (chatProvider === 'firebase') {
  console.log("Using Firebase as a backend.");
  dbService = firebaseService;
} else {
  console.log("No chat provider specified, defaulting to Supabase.");
  dbService = supabaseService;
}

export { dbService };
