import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import ChatWidget from './ChatWidget';

interface WebViewChatProps {
  tripId?: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  firstName?: string;
  serverUrl: string;
}

// This component will be rendered in a standalone HTML page
const WebViewChat: React.FC<WebViewChatProps> = ({
  tripId: initialTripId,
  userId,
  userType,
  firstName: initialFirstName,
  serverUrl
}) => {
  const [tripId, setTripId] = useState(initialTripId || '');
  const [firstName, setFirstName] = useState(initialFirstName);
  const [showChat, setShowChat] = useState(userType !== 'admin');

  useEffect(() => {
    // If firstName not provided as prop, try to extract from URL
    if (!firstName) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlFirstName = urlParams.get('firstName');
      if (urlFirstName) {
        console.log('WebViewChat - Extracted firstName from URL:', urlFirstName);
        setFirstName(urlFirstName);
      }
    }
  }, [firstName]);

  if (userType === 'admin' && !showChat) {
    return (
      <AdminContainer>
        <h2>Enter Trip Details</h2>
        <InputGroup>
          <label htmlFor="tripId">Trip ID:</label>
          <input
            id="tripId"
            type="text"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            placeholder="Enter Trip ID"
          />
          <button 
            onClick={() => setShowChat(true)}
            disabled={!tripId.trim()}
          >
            Join Chat
          </button>
        </InputGroup>
      </AdminContainer>
    );
  }

  return (
    <Container>
      <ChatWidget
        tripId={tripId}
        userId={userId}
        userType={userType}
        firstName={firstName}
        serverUrl={serverUrl}
        initiallyOpen={true}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
`;

const AdminContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 20px;
    color: #333;
    text-align: center;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-weight: 500;
    color: #666;
  }

  input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;

    &:focus {
      outline: none;
      border-color: #007AFF;
    }
  }

  button {
    margin-top: 10px;
    padding: 10px;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }
`;

export default WebViewChat; 