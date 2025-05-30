import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { BsChatDots } from 'react-icons/bs';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from './useChat';

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
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          <BsChatDots size={24} style={{ display: 'block' }} aria-hidden="true" />
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
              messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
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
  background-color: #f05a29;
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