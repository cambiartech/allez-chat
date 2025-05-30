import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { BsChatDots } from 'react-icons/bs';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from './useChat';
import { io, Socket } from 'socket.io-client';
import config from '../../config';
import { Message, User, TypingUser } from '../../types/chat';

interface ChatWidgetProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  serverUrl?: string;
  initiallyOpen?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  tripId,
  userId,
  userType,
  serverUrl = 'http://localhost:5001',
  initiallyOpen = false
}) => {
  const {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat({ tripId, userId, userType, serverUrl });

  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  }, [inputMessage, sendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    startTyping();
  }, [startTyping]);

  useEffect(() => {
    // Initialize socket connection using config URL
    const newSocket = io(config.SOCKET_URL, {
      transports: ['websocket'],
      query: { tripId }
    });

    setSocket(newSocket);

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      newSocket.emit('join_room', { tripId, userId, userType });
    });

    newSocket.on('room_history', (data: { messages: Message[] }) => {
      sendMessage(data.messages);
    });

    newSocket.on('receive_message', (message: Message) => {
      sendMessage([message]);
    });

    newSocket.on('typing_status', ({ typingUsers: users }: { typingUsers: TypingUser[] }) => {
      startTyping(users);
    });

    return () => {
      newSocket.close();
    };
  }, [tripId, userId, userType, sendMessage, startTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {!isOpen && (
        <ChatButton
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <BsChatDots size={24} />
        </ChatButton>
      )}

      <AnimatePresence>
        {isOpen && (
          <ChatContainer
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <ChatHeader
              tripId={tripId}
              onClose={() => setIsOpen(false)}
              isConnected={isConnected}
            />

            <MessageList
              messages={messages}
              currentUserId={userId}
              typingUsers={typingUsers}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              value={inputMessage}
              onChange={handleInputChange}
              onSend={handleSendMessage}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              onBlur={stopTyping}
            />
          </ChatContainer>
        )}
      </AnimatePresence>
    </>
  );
};

const ChatButton = styled(motion.button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #007AFF;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

const ChatContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
`;

export default ChatWidget; 