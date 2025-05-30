import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, User, TypingUser } from '../../types/chat';

interface ChatUser {
  userId: string;
  userType: string;
}

interface UseChatProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  serverUrl: string;
}

export const useChat = ({ tripId, userId, userType, serverUrl }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(serverUrl);
    socketRef.current = socket;

    // Connect to chat room
    socket.emit('join_room', { tripId, userType, userId });

    // Handle connection status
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Handle incoming messages
    socket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Handle room history
    socket.on('room_history', ({ messages: history }) => {
      setMessages(history);
    });

    // Handle typing status
    socket.on('typing_status', ({ typingUsers: users }) => {
      setTypingUsers(users.filter((user: ChatUser) => user.userId !== userId));
    });

    // Handle user joined/left events
    socket.on('user_joined', (data) => {
      setMessages(prev => [...prev, {
        userId: data.userId,
        userType: data.userType,
        message: data.message,
        timestamp: data.timestamp
      }]);
    });

    socket.on('user_left', (data) => {
      setMessages(prev => [...prev, {
        userId: data.userId,
        userType: data.userType,
        message: data.message,
        timestamp: data.timestamp
      }]);
    });

    return () => {
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
    }
  }, [userId, userType]);

  const startTyping = useCallback((users?: TypingUser[]) => {
    if (users) {
      setTypingUsers(users);
    }
  }, []);

  const stopTyping = useCallback(() => {
    setTypingUsers([]);
  }, []);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping
  };
}; 