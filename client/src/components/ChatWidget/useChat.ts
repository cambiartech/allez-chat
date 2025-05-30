import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  userId: string;
  userType: string;
  message: string;
  timestamp: string;
}

interface ChatUser {
  userId: string;
  userType: string;
}

interface UseChatProps {
  tripId: string;
  userId: string;
  userType: string;
  serverUrl: string;
}

export const useChat = ({ tripId, userId, userType, serverUrl }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<ChatUser[]>([]);
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

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        tripId,
        message,
        userType,
        userId
      });
    }
  }, [tripId, userId, userType]);

  const startTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { tripId, isTyping: true });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('typing', { tripId, isTyping: false });
        }
      }, 1000);
    }
  }, [tripId]);

  const stopTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { tripId, isTyping: false });
    }
  }, [tripId]);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping
  };
}; 