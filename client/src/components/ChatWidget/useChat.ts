import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, TypingUser } from '../../types/chat';
import config from '../../config';

interface ChatUser {
  userId: string;
  userType: string;
  firstName?: string;
}

interface UseChatProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  firstName?: string;
  serverUrl?: string;
}

export const useChat = ({ tripId, userId, userType, firstName, serverUrl }: UseChatProps) => {
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
      firstName,
      socketUrl,
      config: config,
      env: process.env.REACT_APP_ENV
    });
    
    // Initialize socket connection with error handling
    try {
      const socket = io(socketUrl, {
        path: '/socket.io',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: {
          tripId,
          userId,
          userType,
          firstName
        },
        forceNew: true,
        autoConnect: false,
        timeout: 10000
      });

      // Add debug logging
      socket.io.on("packet", (packet) => {
        console.log("Socket.IO packet:", packet);
      });

      socket.io.on("error", (error) => {
        console.error("Socket.IO transport error:", error);
      });

      // Add connection event listeners before connecting
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', {
          error: err,
          message: err.message,
          stack: err.stack
        });
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);
      });

      socket.on('connect', () => {
        console.log('Socket connected successfully. Socket ID:', socket.id);
        setIsConnected(true);
        setError(null);
        
        // Join the room with firstName
        socket.emit('join_room', { tripId, userId, userType, firstName });
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        setIsConnected(false);
      });

      // Now connect
      console.log('Attempting socket connection to:', socketUrl);
      socket.connect();
      
      socketRef.current = socket;

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
  }, [tripId, userId, userType, firstName, serverUrl]);

  const sendMessage = useCallback((message: string | Message[]) => {
    if (!socketRef.current?.connected) {
      console.warn('Attempting to send message while socket is disconnected');
      return;
    }

    if (Array.isArray(message)) {
      console.log('Adding batch messages:', message);
      setMessages(prevMessages => [...prevMessages, ...message]);
    } else {
      console.log('Sending message:', message);
      
      socketRef.current.emit('send_message', { 
        tripId, 
        message, 
        userType, 
        userId,
        firstName 
      });
    }
  }, [tripId, userId, userType, firstName]);

  const startTyping = useCallback((users?: TypingUser[]) => {
    if (users) {
      console.log('Setting typing users:', users);
      setTypingUsers(users);
    } else if (socketRef.current?.connected) {
      console.log('Emitting typing start:', { userId, userType, firstName });
      socketRef.current.emit('typing', { tripId, isTyping: true });
    }
  }, [tripId, userId, userType, firstName]);

  const stopTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Emitting typing stop:', { userId, userType, firstName });
      socketRef.current.emit('typing', { tripId, isTyping: false });
    }
  }, [tripId, userId, userType, firstName]);

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