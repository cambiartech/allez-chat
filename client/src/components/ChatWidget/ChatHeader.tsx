import React from 'react';
import styled from '@emotion/styled';
import { IoMdClose, IoMdDownload } from 'react-icons/io';
import { Message } from '../../types/chat';

interface ChatHeaderProps {
  tripId: string;
  onClose: () => void;
  isConnected: boolean;
  userType?: 'driver' | 'rider' | 'admin';
  messages?: Message[];
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  tripId, 
  onClose, 
  isConnected, 
  userType,
  messages = []
}) => {
  const exportChatHistory = () => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    // Create CSV content
    const csvHeaders = ['Trip ID', 'Timestamp', 'User Type', 'Name', 'Message'];
    const csvRows = messages.map(msg => [
      tripId,
      new Date(msg.timestamp).toLocaleString(),
      msg.userType,
      msg.firstName || (msg.userType === 'driver' ? 'Driver' : msg.userType === 'rider' ? 'Rider' : 'Admin'),
      `"${msg.message.replace(/"/g, '""')}"` // Escape quotes in message content
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `chat-trip-${tripId}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Header>
      <div>
        <Title>Trip #{tripId}</Title>
        <Status isConnected={isConnected}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </Status>
      </div>
      <ButtonGroup>
        {userType === 'admin' && (
          <ExportButton onClick={exportChatHistory} title="Export Chat History">
            <IoMdDownload size={20} aria-hidden="true" />
          </ExportButton>
        )}
        <CloseButton onClick={onClose}>
          <IoMdClose size={24} aria-hidden="true" />
        </CloseButton>
      </ButtonGroup>
    </Header>
  );
};

const Header = styled.div`
  padding: 15px;
  background-color: #ff8f00;
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

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ExportButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
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