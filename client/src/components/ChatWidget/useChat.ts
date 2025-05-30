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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection using provided URL or config default
    const socket = io(serverUrl || config.SOCKET_URL);
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
    sendMessage,
    startTyping,
    stopTyping
  };
}; 