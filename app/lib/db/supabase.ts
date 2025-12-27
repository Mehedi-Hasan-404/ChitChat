// lib/db/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { ChatService, Message, UserProfile, OnlineUser, TypingUser } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService: ChatService = {
  async sendMessage(message: Message): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert([{
        content: message.content,
        user_id: message.userId,
        user_name: message.userName,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToMessages(callback: (messages: Message[]) => void): () => void {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        async () => {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(100);

          if (error) {
            console.error('Error fetching messages:', error);
            return;
          }

          const messages: Message[] = (data || []).map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            userId: msg.user_id,
            userName: msg.user_name,
            timestamp: new Date(msg.created_at).getTime()
          }));

          callback(messages);
        }
      )
      .subscribe();

    // Initial fetch
    (async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        const messages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          userId: msg.user_id,
          userName: msg.user_name,
          timestamp: new Date(msg.created_at).getTime()
        }));
        callback(messages);
      }
    })();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async createOrUpdateUserProfile(profile: UserProfile): Promise<void> {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatarUrl,
        last_seen: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      lastSeen: new Date(data.last_seen).getTime()
    };
  },

  async setUserOnline(userId: string, userName: string): Promise<void> {
    const { error } = await supabase
      .from('online_users')
      .upsert({
        id: userId,
        name: userName,
        last_seen: new Date().toISOString()
      });

    if (error) {
      console.error('Error setting user online:', error);
      throw error;
    }
  },

  async setUserOffline(userId: string): Promise<void> {
    const { error } = await supabase
      .from('online_users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error setting user offline:', error);
      throw error;
    }
  },

  subscribeToOnlineUsers(callback: (users: OnlineUser[]) => void): () => void {
    const channel = supabase
      .channel('online_users')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'online_users' },
        async () => {
          const { data, error } = await supabase
            .from('online_users')
            .select('*');

          if (error) {
            console.error('Error fetching online users:', error);
            return;
          }

          const users: OnlineUser[] = (data || []).map((user: any) => ({
            id: user.id,
            name: user.name,
            lastSeen: new Date(user.last_seen).getTime()
          }));

          callback(users);
        }
      )
      .subscribe();

    // Initial fetch
    (async () => {
      const { data, error } = await supabase
        .from('online_users')
        .select('*');

      if (!error && data) {
        const users: OnlineUser[] = data.map((user: any) => ({
          id: user.id,
          name: user.name,
          lastSeen: new Date(user.last_seen).getTime()
        }));
        callback(users);
      }
    })();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async setUserTyping(userId: string, userName: string, isTyping: boolean): Promise<void> {
    if (isTyping) {
      const { error } = await supabase
        .from('typing_users')
        .upsert({
          id: userId,
          name: userName,
          is_typing: true,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error setting user typing:', error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('typing_users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error removing typing status:', error);
        throw error;
      }
    }
  },

  subscribeToTypingUsers(callback: (users: TypingUser[]) => void): () => void {
    const channel = supabase
      .channel('typing_users')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'typing_users' },
        async () => {
          const { data, error } = await supabase
            .from('typing_users')
            .select('*');

          if (error) {
            console.error('Error fetching typing users:', error);
            return;
          }

          const users: TypingUser[] = (data || []).map((user: any) => ({
            id: user.id,
            name: user.name,
            isTyping: user.is_typing
          }));

          callback(users);
        }
      )
      .subscribe();

    // Initial fetch
    (async () => {
      const { data, error } = await supabase
        .from('typing_users')
        .select('*');

      if (!error && data) {
        const users: TypingUser[] = data.map((user: any) => ({
          id: user.id,
          name: user.name,
          isTyping: user.is_typing
        }));
        callback(users);
      }
    })();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
