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

interface DatabaseMessage {
  id: string;
  trip_id: string;
  user_id: string;
  user_type: string;
  message: string;
  created_at: string;
}

export const useSupabaseChat = ({ tripId, userId, userType, supabaseUrl, supabaseKey }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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

          // Load message history from database
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
    if (!supabaseRef.current) return;
    
    setIsLoadingHistory(true);
    console.log('Loading message history for trip:', tripId);
    
    try {
      const { data, error } = await supabaseRef.current
        .from('chat_messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading message history:', error);
        // Don't set error state for missing table - it's optional
        if (!error.message.includes('relation "chat_messages" does not exist')) {
          setError(`Failed to load message history: ${error.message}`);
        }
        return;
      }

      if (data && data.length > 0) {
        const historyMessages: Message[] = data.map((dbMsg: DatabaseMessage) => ({
          userId: dbMsg.user_id,
          userType: dbMsg.user_type as 'driver' | 'rider' | 'admin',
          message: dbMsg.message,
          timestamp: dbMsg.created_at
        }));
        
        console.log(`Loaded ${historyMessages.length} messages from history`);
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Error loading message history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [tripId]);

  const saveMessageToDatabase = useCallback(async (message: Message) => {
    if (!supabaseRef.current) return;
    
    try {
      const { error } = await supabaseRef.current
        .from('chat_messages')
        .insert({
          trip_id: tripId,
          user_id: message.userId,
          user_type: message.userType,
          message: message.message,
          created_at: message.timestamp
        });

      if (error) {
        console.error('Error saving message to database:', error);
        // Don't throw error - real-time still works without persistence
      }
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  }, [tripId]);

  const cleanupOldMessages = useCallback(async () => {
    if (!supabaseRef.current) return;
    
    try {
      // Delete messages older than 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabaseRef.current
        .from('chat_messages')
        .delete()
        .lt('created_at', twoHoursAgo);

      if (error) {
        console.error('Error cleaning up old messages:', error);
      } else {
        console.log('Cleaned up messages older than 2 hours');
      }
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
    }
  }, []);

  const sendMessage = useCallback(async (message: string | Message[]) => {
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
      
      // Save to database first (for persistence)
      await saveMessageToDatabase(newMessage);
      
      // Then broadcast the message to all subscribers (for real-time)
      channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: newMessage
      });

      // Periodically cleanup old messages (every 10th message)
      if (Math.random() < 0.1) {
        cleanupOldMessages();
      }
    }
  }, [userId, userType, isConnected, saveMessageToDatabase, cleanupOldMessages]);

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
    isLoadingHistory,
    sendMessage,
    startTyping,
    stopTyping
  };
}; 