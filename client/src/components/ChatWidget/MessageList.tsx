import React, { RefObject } from 'react';
import styled from '@emotion/styled';
import { Message, TypingUser } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  currentUserType: 'driver' | 'rider' | 'admin';
  typingUsers: TypingUser[];
  messagesEndRef: RefObject<HTMLDivElement>;
  isLoadingHistory?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  currentUserType,
  typingUsers,
  messagesEndRef,
  isLoadingHistory = false
}) => {
  const getDisplayName = (msg: Message) => {
    // For admin messages, always show "Admin"
    if (msg.userType === 'admin') {
      return 'Admin';
    }

    // For own messages, show own firstName if available
    const isOwnMessage = msg.userId === currentUserId && msg.userType === currentUserType;
    if (isOwnMessage) {
      return msg.firstName || (msg.userType === 'driver' ? 'Driver' : 'Rider');
    }

    // For other person's messages, show their name
    // The message should contain the sender's firstName and the otherName
    // We want to show the sender's firstName to the viewer
    if (msg.firstName) {
      return msg.firstName;
    }

    // Fallback to default labels
    return msg.userType === 'driver' ? 'Driver' : 'Rider';
  };

  const getDisplayIcon = (userType: string) => {
    return userType === 'driver' ? '🚗' : 
           userType === 'rider' ? '👤' : 
           '👨‍💼';
  };

  return (
    <Container>
      <MessagesWrapper>
        {isLoadingHistory && (
          <LoadingIndicator>
            Loading message history...
          </LoadingIndicator>
        )}
        {messages.map((msg, index) => {
          // A message is "own" if it's from the current user (same userId AND userType)
          const isOwnMessage = msg.userId === currentUserId && msg.userType === currentUserType;
          
          return (
            <MessageBubble
              key={`${msg.timestamp}-${index}`}
              isOwn={isOwnMessage}
            >
              {!isOwnMessage && (
                <UserLabel userType={msg.userType}>
                  {getDisplayIcon(msg.userType)} {getDisplayName(msg)}
                </UserLabel>
              )}
              <MessageText>{msg.message}</MessageText>
              <MessageTime>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </MessageTime>
            </MessageBubble>
          );
        })}
        {typingUsers.length > 0 && (
          <TypingIndicator>
            {typingUsers.map(user => user.firstName || user.userId).join(', ')} is typing...
          </TypingIndicator>
        )}
        <div ref={messagesEndRef} />
      </MessagesWrapper>
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
`;

const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 15px;
  background-color: ${props => (props.isOwn ? '#ff8f00' : 'white')};
  color: ${props => (props.isOwn ? 'white' : 'black')};
  align-self: ${props => (props.isOwn ? 'flex-end' : 'flex-start')};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: ${props => (props.isOwn ? 'none' : '1px solid #e0e0e0')};
`;

const MessageText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
`;

const MessageTime = styled.span`
  display: block;
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
`;

const TypingIndicator = styled.div`
  font-size: 12px;
  color: #666;
  font-style: italic;
  padding: 5px 0;
`;

const UserLabel = styled.span<{ userType: string }>`
  font-size: 12px;
  font-weight: bold;
  margin-right: 5px;
  color: ${props => {
    switch (props.userType) {
      case 'driver':
        return '#007bff';
      case 'rider':
        return '#28a745';
      case 'admin':
        return '#dc3545';
      default:
        return 'black';
    }
  }};
`;

const LoadingIndicator = styled.div`
  font-size: 12px;
  color: #666;
  font-style: italic;
  padding: 5px 0;
`; 