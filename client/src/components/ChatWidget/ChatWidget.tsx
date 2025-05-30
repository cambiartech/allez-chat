import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { BsChatDots } from 'react-icons/bs';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useSupabaseChat } from './useSupabaseChat';
import config from '../../config';

interface ChatWidgetProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  initiallyOpen?: boolean;
  serverUrl?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  tripId,
  userId,
  userType,
  initiallyOpen = false,
  serverUrl
}) => {
  const {
    messages,
    typingUsers,
    isConnected,
    error,
    isLoadingHistory,
    sendMessage,
    startTyping,
    stopTyping
  } = useSupabaseChat({ 
    tripId, 
    userId, 
    userType, 
    supabaseUrl: config.SUPABASE_URL,
    supabaseKey: config.SUPABASE_ANON_KEY
  });

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

  // For driver/rider views, always show full screen
  const isAppView = userType === 'driver' || userType === 'rider';

  return (
    <>
      {!isOpen && !isAppView && (
        <ChatButton
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <BsChatDots size={24} style={{ display: 'block' }} aria-hidden="true" />
        </ChatButton>
      )}

      <AnimatePresence>
        {(isOpen || isAppView) && (
          <ChatContainer
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            $isAppView={isAppView}
          >
            <ChatHeader
              tripId={tripId}
              onClose={() => !isAppView && setIsOpen(false)}
              isConnected={isConnected}
            />

            {error ? (
              <ErrorMessage>
                {error}
                <RetryButton onClick={() => window.location.reload()}>
                  Retry Connection
                </RetryButton>
              </ErrorMessage>
            ) : (
              <>
                <MessageList
                  messages={messages}
                  currentUserId={userId}
                  currentUserType={userType}
                  typingUsers={typingUsers}
                  messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
                  isLoadingHistory={isLoadingHistory}
                />

                <ChatInput
                  value={inputMessage}
                  onChange={handleInputChange}
                  onSend={handleSendMessage}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  onBlur={stopTyping}
                  disabled={!isConnected}
                />
              </>
            )}
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

const ChatContainer = styled(motion.div)<{ $isAppView: boolean }>`
  position: ${props => props.$isAppView ? 'fixed' : 'fixed'};
  bottom: ${props => props.$isAppView ? '0' : '20px'};
  right: ${props => props.$isAppView ? '0' : '20px'};
  width: ${props => props.$isAppView ? '100%' : '350px'};
  height: ${props => props.$isAppView ? '100%' : '500px'};
  background-color: white;
  border-radius: ${props => props.$isAppView ? '0' : '12px'};
  box-shadow: ${props => props.$isAppView ? 'none' : '0 5px 20px rgba(0, 0, 0, 0.15)'};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  margin: 20px;
  background-color: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #d32f2f;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RetryButton = styled.button`
  padding: 8px 16px;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

export default ChatWidget; 