// lib/db/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { ChatService, Message, UserProfile, OnlineUser, TypingUser } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let messageChannel: any = null;
let presenceChannel: any = null;
let typingChannel: any = null;

export const supabaseService: ChatService = {
  init(onMessages, onOnlineUsers, onTypingUsers) {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) console.error('Error fetching messages:', error);
      else {
        const formattedMessages: Message[] = (data || []).map(msg => ({
          id: msg.id.toString(),
          text: msg.text,
          timestamp: new Date(msg.created_at).getTime(),
          sender: msg.sender,
          sessionId: msg.session_id,
        })).reverse();
        onMessages(formattedMessages);
      }
    };
    fetchMessages();

    // Listen for new messages
    messageChannel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new;
        const formattedMessage: Message = {
            id: newMessage.id.toString(),
            text: newMessage.text,
            timestamp: new Date(newMessage.created_at).getTime(),
            sender: newMessage.sender,
            sessionId: newMessage.session_id,
        };
        // This is a simplified update; for a real app, you'd merge this with existing state
        fetchMessages();
      })
      .subscribe();
      
    // Listen for typing status
    typingChannel = supabase.channel('typing');
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
          const currentTypingUsers = payload.users || [];
          onTypingUsers(currentTypingUsers);
      })
      .subscribe();

    // Listen for online presence
    presenceChannel = supabase.channel('presence', {
        config: {
          presence: {
            key: '', // This will be set in setupPresence
          },
        },
    });
    presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: OnlineUser[] = Object.values(state).map((presence: any) => presence[0]);
        onOnlineUsers(users);
    });
    presenceChannel.subscribe();
  },

  async sendMessage(message) {
    const { error } = await supabase.from('messages').insert({
      text: message.text,
      session_id: message.sessionId,
      sender: message.sender,
    });
    if (error) console.error('Error sending message:', error);
  },

  async uploadImage(file) {
    const filePath = `chat_images/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('chat_images').upload(filePath, file);
    if (error) {
        console.error('Error uploading image:', error);
        throw new Error('Image upload failed');
    }
    const { data } = supabase.storage.from('chat_images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  setTypingStatus(user, isTyping) {
    if(typingChannel) {
        typingChannel.send({
            type: 'broadcast',
            event: 'typing-update',
            payload: { user, isTyping }
        });
    }
  },

  setupPresence(user) {
    if (presenceChannel) {
        presenceChannel.opts.config.presence.key = user.sessionId;
        presenceChannel.track({ name: user.name, sessionId: user.sessionId });
    }
  },

  cleanup() {
    if (messageChannel) supabase.removeChannel(messageChannel);
    if (presenceChannel) supabase.removeChannel(presenceChannel);
    if (typingChannel) supabase.removeChannel(typingChannel);
  },
};

// This is a workaround for Supabase typing broadcast, which is more complex than Firebase's.
// A full implementation would require a serverless function or more complex client-side logic
// to manage the list of typing users. This is a simplified placeholder.
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CHAT_PROVIDER === 'supabase') {
    let typingUsers = new Map<string, TypingUser>();
    const typingTimeout = new Map<string, NodeJS.Timeout>();

    const broadcastTypingState = () => {
        supabase.channel('typing').send({
            type: 'broadcast',
            event: 'typing',
            payload: { users: Array.from(typingUsers.values()) }
        });
    };

    supabase.channel('typing').on('broadcast', { event: 'typing-update' }, ({ payload }: { payload: any }) => {
        const { user, isTyping } = payload;
        
        // Clear any existing timeout for this user
        if (typingTimeout.has(user.sessionId)) {
            clearTimeout(typingTimeout.get(user.sessionId)!);
            typingTimeout.delete(user.sessionId);
        }

        if (isTyping) {
            typingUsers.set(user.sessionId, user);
            const timeout = setTimeout(() => {
                typingUsers.delete(user.sessionId);
                broadcastTypingState();
            }, 3000); // User is considered not typing after 3 seconds
            typingTimeout.set(user.sessionId, timeout);
        } else {
            typingUsers.delete(user.sessionId);
        }
        
        broadcastTypingState();
    }).subscribe();
}
