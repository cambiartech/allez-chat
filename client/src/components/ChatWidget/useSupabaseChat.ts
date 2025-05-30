import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Message, TypingUser } from '../../types/chat';

interface UseChatProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  supabaseUrl?: string;
  supabaseKey?: string;
}

export const useSupabaseChat = ({ tripId, userId, userType, supabaseUrl, supabaseKey }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Use provided credentials or default to demo credentials
    const url = supabaseUrl || 'https://your-project.supabase.co';
    const key = supabaseKey || 'your-anon-key';
    
    console.log('Initializing Supabase chat:', {
      tripId,
      userId,
      userType,
      url: url.substring(0, 20) + '...'
    });

    try {
      // Initialize Supabase client
      const supabase = createClient(url, key);
      supabaseRef.current = supabase;

      // Create a channel for this trip
      const channel = supabase.channel(`trip-${tripId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: userId }
        }
      });
      channelRef.current = channel;

      // Subscribe to message broadcasts
      channel.on('broadcast', { event: 'message' }, (payload) => {
        console.log('Received message:', payload);
        const message = payload.payload as Message;
        setMessages(prev => [...prev, message]);
      });

      // Subscribe to typing broadcasts
      channel.on('broadcast', { event: 'typing' }, (payload) => {
        console.log('Received typing event:', payload);
        const { userId: typingUserId, userType: typingUserType, isTyping } = payload.payload;
        
        setTypingUsers(prev => {
          if (isTyping) {
            // Add user to typing list if not already there
            if (!prev.find(u => u.userId === typingUserId)) {
              return [...prev, { userId: typingUserId, userType: typingUserType }];
            }
            return prev;
          } else {
            // Remove user from typing list
            return prev.filter(u => u.userId !== typingUserId);
          }
        });
      });

      // Handle presence (user join/leave)
      channel.on('presence', { event: 'sync' }, () => {
        console.log('Presence sync:', channel.presenceState());
        setIsConnected(true);
        setError(null);
      });

      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      });

      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

      // Subscribe to the channel
      channel.subscribe(async (status) => {
        console.log('Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
          
          // Track presence
          await channel.track({
            userId,
            userType,
            online_at: new Date().toISOString(),
          });

          // Load message history (you can implement this with a database table)
          loadMessageHistory();
        } else if (status === 'CHANNEL_ERROR') {
          setError('Failed to connect to chat');
          setIsConnected(false);
        }
      });

      return () => {
        console.log('Cleaning up Supabase connection');
        channel.unsubscribe();
      };
    } catch (error) {
      const err = error as Error;
      console.error('Error initializing Supabase:', err);
      setError(`Failed to initialize chat: ${err.message}`);
      return () => {};
    }
  }, [tripId, userId, userType, supabaseUrl, supabaseKey]);

  const loadMessageHistory = useCallback(async () => {
    // This would load messages from a Supabase table
    // For now, we'll just set an empty array
    console.log('Loading message history for trip:', tripId);
    // You can implement this by creating a 'messages' table in Supabase
  }, [tripId]);

  const sendMessage = useCallback((message: string | Message[]) => {
    if (!channelRef.current || !isConnected) {
      console.warn('Attempting to send message while not connected');
      return;
    }

    if (Array.isArray(message)) {
      console.log('Adding batch messages:', message);
      setMessages(prevMessages => [...prevMessages, ...message]);
    } else {
      const newMessage: Message = {
        userId,
        userType,
        message,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending message:', newMessage);
      
      // Broadcast the message to all subscribers
      channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: newMessage
      });
    }
  }, [userId, userType, isConnected]);

  const startTyping = useCallback(() => {
    if (!channelRef.current || !isConnected) return;
    
    console.log('Broadcasting typing start:', { userId, userType });
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, userType, isTyping: true }
    });
  }, [userId, userType, isConnected]);

  const stopTyping = useCallback(() => {
    if (!channelRef.current || !isConnected) return;
    
    console.log('Broadcasting typing stop:', { userId, userType });
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, userType, isTyping: false }
    });
  }, [userId, userType, isConnected]);

  return {
    messages,
    typingUsers,
    isConnected,
    error,
    sendMessage,
    startTyping,
    stopTyping
  };
}; 