import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

interface Message {
  userId: string;
  userType: string;
  message: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: { userId: string; userType: string }[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  typingUsers,
  messagesEndRef
}) => {
  return (
    <Container>
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          isOwn={msg.userId === currentUserId}
        >
          <UserType>{msg.userType}</UserType>
          <MessageText>{msg.message}</MessageText>
          <TimeStamp>
            {new Date(msg.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </TimeStamp>
        </MessageBubble>
      ))}
      
      {typingUsers.length > 0 && (
        <TypingIndicator>
          {typingUsers.map(user => user.userType).join(', ')} 
          {typingUsers.length === 1 ? ' is' : ' are'} typing...
        </TypingIndicator>
      )}
      
      <div ref={messagesEndRef} />
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #F5F5F5;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageBubble = styled(motion.div)<{ isOwn: boolean }>`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  background-color: ${props => props.isOwn ? '#007AFF' : '#E9ECEF'};
  color: ${props => props.isOwn ? 'white' : 'black'};
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  position: relative;
`;

const UserType = styled.span`
  font-size: 12px;
  opacity: 0.7;
  display: block;
  margin-bottom: 4px;
`;

const MessageText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
`;

const TimeStamp = styled.span`
  font-size: 10px;
  opacity: 0.7;
  display: block;
  margin-top: 4px;
  text-align: right;
`;

const TypingIndicator = styled.div`
  font-size: 12px;
  color: #666;
  font-style: italic;
  padding: 5px 10px;
  background-color: #fff;
  border-radius: 10px;
  align-self: flex-start;
  margin-top: 5px;
`; 