import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, TypingUser } from '../../types/chat';
import config from '../../config';

interface ChatUser {
  userId: string;
  userType: string;
}

interface UseChatProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  serverUrl?: string;
}

export const useChat = ({ tripId, userId, userType, serverUrl }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = serverUrl || config.SOCKET_URL;
    console.log('Chat initialization:', {
      tripId,
      userId,
      userType,
      socketUrl,
      config: config,
      env: process.env.REACT_APP_ENV
    });
    
    // Initialize socket connection with error handling
    try {
      console.log('Attempting socket connection to:', socketUrl);
      const socket = io(socketUrl, {
        path: '/.netlify/functions/chat',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: {
          tripId,
          userId,
          userType
        },
        forceNew: true
      });
      
      socketRef.current = socket;

      // Connect to chat room
      socket.emit('join_room', { tripId, userType, userId });
      console.log('Emitted join_room event:', { tripId, userType, userId });

      // Handle connection status
      socket.on('connect', () => {
        console.log('Socket connected successfully. Socket ID:', socket.id);
        setIsConnected(true);
        setError(null);
      });
      
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', {
          error: err,
          message: err.message
        });
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        setIsConnected(false);
      });

      socket.on('error', (err: Error) => {
        console.error('Socket error:', err);
        setError(`Socket error: ${err.message}`);
      });

      // Handle incoming messages
      socket.on('receive_message', (message: Message) => {
        console.log('Received message:', message);
        setMessages(prev => [...prev, message]);
      });

      // Handle room history
      socket.on('room_history', ({ messages: history }) => {
        console.log('Received room history:', history);
        setMessages(history);
      });

      // Handle typing status
      socket.on('typing_status', ({ typingUsers: users }) => {
        const filteredUsers = users.filter((user: ChatUser) => user.userId !== userId);
        console.log('Typing status update:', { users, filteredUsers });
        setTypingUsers(filteredUsers);
      });

      return () => {
        console.log('Cleaning up socket connection');
        socket.disconnect();
      };
    } catch (error) {
      const err = error as Error;
      console.error('Error initializing socket:', err);
      setError(`Failed to initialize chat: ${err.message}`);
      return () => {};
    }
  }, [tripId, userId, userType, serverUrl]);

  const sendMessage = useCallback((message: string | Message[]) => {
    if (!socketRef.current?.connected) {
      console.warn('Attempting to send message while socket is disconnected');
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
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      socketRef.current.emit('send_message', newMessage);
    }
  }, [userId, userType]);

  const startTyping = useCallback((users?: TypingUser[]) => {
    if (users) {
      console.log('Setting typing users:', users);
      setTypingUsers(users);
    } else if (socketRef.current?.connected) {
      console.log('Emitting typing start:', { userId, userType });
      socketRef.current.emit('typing_start', { userId, userType });
    }
  }, [userId, userType]);

  const stopTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Emitting typing stop:', { userId, userType });
      socketRef.current.emit('typing_stop', { userId, userType });
    }
    setTypingUsers([]);
  }, [userId, userType]);

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