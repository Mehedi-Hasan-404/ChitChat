// lib/db/index.ts

import { firebaseService } from './firebase';
import { supabaseService } from './supabase';
import { ChatService } from '../types';

const provider = process.env.NEXT_PUBLIC_CHAT_PROVIDER || 'firebase';

export const chatService: ChatService = provider === 'supabase' ? supabaseService : firebaseService;

export * from '../types';
