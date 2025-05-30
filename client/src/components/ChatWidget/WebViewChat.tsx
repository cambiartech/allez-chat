import React from 'react';
import styled from '@emotion/styled';
import ChatWidget from './ChatWidget';

// This component will be rendered in a standalone HTML page
const WebViewChat: React.FC = () => {
  // Get parameters from URL query string
  const params = new URLSearchParams(window.location.search);
  const tripId = params.get('tripId') || '';
  const userId = params.get('userId') || '';
  const userType = params.get('userType') as 'driver' | 'rider' | 'admin';
  const serverUrl = params.get('serverUrl') || 'http://localhost:5001';

  return (
    <Container>
      <ChatWidget
        tripId={tripId}
        userId={userId}
        userType={userType}
        serverUrl={serverUrl}
      />
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: white;
`;

export default WebViewChat; 