import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Message, TypingUser } from '../../types/chat';

interface UseChatProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  firstName?: string;
  otherName?: string;
  driverId?: string;
  riderId?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

interface DatabaseMessage {
  id: string;
  trip_id: string;
  user_id: string;
  user_type: string;
  first_name?: string;
  other_name?: string;
  driver_id?: string;
  rider_id?: string;
  message: string;
  created_at: string;
}

export const useSupabaseChat = ({ tripId, userId, userType, firstName, otherName, driverId, riderId, supabaseUrl, supabaseKey }: UseChatProps) => {
  console.log('🔍 useSupabaseChat hook initialized with:', {
    tripId,
    userId,
    userType,
    firstName,
    otherName,
    driverId,
    riderId
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

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

      console.log('Database query result:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('Error loading message history:', error);
        // Don't set error state for missing table - it's optional
        if (!error.message.includes('relation "chat_messages" does not exist')) {
          setError(`Failed to load message history: ${error.message}`);
        }
        return;
      }

      if (data && data.length > 0) {
        // Sort messages by timestamp to ensure proper chronological order
        const sortedData = data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        const historyMessages: Message[] = sortedData.map((dbMsg: DatabaseMessage) => ({
          id: dbMsg.id?.toString() || Date.now().toString(),
          userId: dbMsg.user_id,
          userType: dbMsg.user_type as 'driver' | 'rider' | 'admin',
          firstName: dbMsg.first_name,
          otherName: dbMsg.other_name,
          driverId: dbMsg.driver_id,
          riderId: dbMsg.rider_id,
          message: dbMsg.message,
          timestamp: dbMsg.created_at
        }));
        
        console.log(`Loaded ${historyMessages.length} messages from history`);
        setMessages(historyMessages);
      } else {
        console.log('No messages found in database for trip:', tripId);
        setMessages([]); // Ensure messages array is empty
      }
    } catch (error) {
      console.error('Error loading message history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [tripId]);

  useEffect(() => {
    // Use provided credentials or default to demo credentials
    const url = supabaseUrl || 'https://your-project.supabase.co';
    const key = supabaseKey || 'your-anon-key';
    
    console.log('Initializing Supabase chat:', {
      tripId,
      userId,
      userType,
      firstName,
      otherName,
      driverId,
      riderId,
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
        const { userId: typingUserId, userType: typingUserType, firstName: typingFirstName, isTyping } = payload.payload;
        
        setTypingUsers(prev => {
          if (isTyping) {
            // Add user to typing list if not already there
            if (!prev.find(u => u.userId === typingUserId)) {
              return [...prev, { userId: typingUserId, userType: typingUserType, firstName: typingFirstName }];
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
            firstName,
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
  }, [tripId, userId, userType, firstName, otherName, driverId, riderId, supabaseUrl, supabaseKey, loadMessageHistory]);

  const saveMessageToDatabase = useCallback(async (message: Message) => {
    if (!supabaseRef.current) {
      console.log('No Supabase client available for saving message');
      return;
    }
    
    console.log('Attempting to save message to database:', message);
    
    try {
      const messageData = {
        trip_id: tripId,
        user_id: message.userId,
        user_type: message.userType,
        first_name: message.firstName,
        other_name: message.otherName,
        driver_id: message.driverId,
        rider_id: message.riderId,
        message: message.message,
        created_at: message.timestamp
      };
      
      console.log('Message data being inserted:', messageData);

      const { data, error } = await supabaseRef.current
        .from('chat_messages')
        .insert(messageData);

      if (error) {
        console.error('Error saving message to database:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        // Don't throw error - real-time still works without persistence
      } else {
        console.log('Message saved successfully to database:', data);
      }
    } catch (error) {
      console.error('Exception while saving message to database:', error);
    }
  }, [tripId]);

  const sendCountUpdates = useCallback(async (message: Message) => {
    try {
      console.log('🔍 sendCountUpdates called with message:', {
        userType: message.userType,
        driverId: message.driverId,
        riderId: message.riderId,
        userId: message.userId
      });
      
      // Determine recipients based on user type
      const recipients = [];
      
      if (message.userType === 'driver' && message.riderId) {
        recipients.push({
          id: message.riderId,
          type: 'passenger'
        });
      } else if (message.userType === 'rider' && message.driverId) {
        recipients.push({
          id: message.driverId,
          type: 'driver'
        });
      } else if (message.userType === 'admin') {
        // Admin messages go to both driver and rider
        // Use message IDs if available, otherwise use fallback values
        const driverIdToUse = message.driverId || driverId || '1566';
        const riderIdToUse = message.riderId || riderId || '6823';
        
        if (driverIdToUse) {
          recipients.push({
            id: driverIdToUse,
            type: 'driver'
          });
        }
        if (riderIdToUse) {
          recipients.push({
            id: riderIdToUse,
            type: 'passenger'
          });
        }
      }

      console.log('Sending count updates to recipients:', recipients);

      // Send count update to each recipient
      for (const recipient of recipients) {
        try {
          // Use local server in development, Netlify function in production
          const apiUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5001/api/chat/count-update'
            : '/.netlify/functions/count-update';
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              tripId: tripId,
              recipientId: recipient.id,
              recipientType: recipient.type,
              count: 1, // Default count, could be calculated based on unread messages
              senderId: message.userId,
              senderType: message.userType === 'rider' ? 'passenger' : message.userType
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Count update sent to ${recipient.type} ${recipient.id}:`, result);
          } else {
            console.error(`❌ Failed to send count update to ${recipient.type} ${recipient.id}:`, response.status);
          }
        } catch (error) {
          console.error(`❌ Error sending count update to ${recipient.type} ${recipient.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in sendCountUpdates:', error);
      // Don't throw error - chat should continue working even if count updates fail
    }
  }, [tripId, driverId, riderId]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!supabaseRef.current || !channelRef.current) {
      console.log('Cannot send message - missing Supabase client or channel');
      return;
    }

    console.log('🔍 sendMessage called with hook values:', {
      userId,
      userType,
      firstName,
      driverId,
      riderId
    });

    const message: Message = {
      id: Date.now().toString(),
      userId,
      userType,
      firstName,
      otherName,
      driverId,
      riderId,
      message: messageText,
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', message);

    // Save to database first
    console.log('About to save message to database...');
    await saveMessageToDatabase(message);
    console.log('Finished saving message to database');

    // Then broadcast to real-time channel
    console.log('About to broadcast message to channel...');
    const broadcastResult = channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: message
    });
    console.log('Broadcast result:', broadcastResult);

    // Send count updates to Socket.IO server for mobile app notifications
    // Only send count updates if user is admin (drivers/riders use Socket.IO which handles this)
    if (userType === 'admin') {
      console.log('About to send count updates...');
      await sendCountUpdates(message);
    } else {
      console.log('Skipping count updates - user is not admin, Socket.IO handles this');
    }
  }, [userId, userType, firstName, otherName, driverId, riderId, saveMessageToDatabase, sendCountUpdates]);

  const startTyping = useCallback(() => {
    if (!channelRef.current || !isConnected) return;
    
    console.log('Broadcasting typing start:', { userId, userType, firstName });
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, userType, firstName, isTyping: true }
    });
  }, [userId, userType, firstName, isConnected]);

  const stopTyping = useCallback(() => {
    if (!channelRef.current || !isConnected) return;
    
    console.log('Broadcasting typing stop:', { userId, userType, firstName });
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, userType, firstName, isTyping: false }
    });
  }, [userId, userType, firstName, isConnected]);

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