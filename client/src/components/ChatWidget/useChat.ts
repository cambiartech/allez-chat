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
    console.log('Attempting to connect to:', socketUrl);
    
    // Initialize socket connection with error handling
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socketRef.current = socket;

    // Connect to chat room
    socket.emit('join_room', { tripId, userType, userId });

    // Handle connection status
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      setError(null);
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
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
      setTypingUsers(users.filter((user: ChatUser) => user.userId !== userId));
    });

    return () => {
      console.log('Cleaning up socket connection');
      socket.disconnect();
    };
  }, [tripId, userId, userType, serverUrl]);

  const sendMessage = useCallback((message: string | Message[]) => {
    if (Array.isArray(message)) {
      setMessages(prevMessages => [...prevMessages, ...message]);
    } else {
      const newMessage: Message = {
        userId,
        userType,
        message,
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Emit the message through socket
      if (socketRef.current) {
        socketRef.current.emit('send_message', newMessage);
      }
    }
  }, [userId, userType]);

  const startTyping = useCallback((users?: TypingUser[]) => {
    if (users) {
      setTypingUsers(users);
    } else if (socketRef.current) {
      socketRef.current.emit('typing_start', { userId, userType });
    }
  }, [userId, userType]);

  const stopTyping = useCallback(() => {
    if (socketRef.current) {
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