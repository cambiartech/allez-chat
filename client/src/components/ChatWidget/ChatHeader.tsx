import React from 'react';
import styled from '@emotion/styled';
import { IconType } from 'react-icons';
import { IoMdClose } from 'react-icons/io';

interface ChatHeaderProps {
  tripId: string;
  onClose: () => void;
  isConnected: boolean;
}

const CloseIcon = IoMdClose as IconType;

export const ChatHeader: React.FC<ChatHeaderProps> = ({ tripId, onClose, isConnected }) => {
  return (
    <Header>
      <div>
        <Title>Trip #{tripId}</Title>
        <Status isConnected={isConnected}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </Status>
      </div>
      <CloseButton onClick={onClose}>
        <CloseIcon size={24} />
      </CloseButton>
    </Header>
  );
};

const Header = styled.div`
  padding: 15px;
  background-color: #007AFF;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const Status = styled.span<{ isConnected: boolean }>`
  font-size: 12px;
  opacity: 0.8;
  color: ${props => props.isConnected ? '#4CD964' : '#FFD60A'};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.8;
  }
`; 